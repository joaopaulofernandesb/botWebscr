import config from './config/config';
import datasource from './config/datasource';
import cheerio from 'cheerio';
import request from 'request-promise';
import interval from 'interval-promise';

const db = datasource(config);

const modelPages = db.models.pages;
const modelProducts = db.models.products;
const modelAltera = db.models.alteracao;

function getUrlsToScrape(amount) {
  return new Promise((resolve, reject) => {
    modelPages.findAll({
      where: {
        read: 0
      },
      limit: amount
    })
    .then(urls => {
      var urlsToReturn = [];

      for (let index = 0; index < urls.length; index++) {
        urlsToReturn.push({
          url: urls[index].url,
          id: urls[index].id,
        });
      }

      resolve(urlsToReturn);
    })
    .catch(err => {
      reject(err);
    })
  })
}

function updatePageScraped(id) {
  return new Promise((resolve, reject) => {
    modelPages.findOne({ where: { id } })
      .then(urlScraped => {

        urlScraped.read = false;
        urlScraped.save();

        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
}

function requestBody(url) {
  return new Promise((resolve, reject) => {
    const options = {
      url,
      transform: function(body) {
        return cheerio.load(body);
      }
    };
    request.get(options)
    .then(($) => {

      // Percorre a lista de produtos
      $('#content').each(function(){
        var url = $(this).find('a').attr('href');
        var name = $(this).find('div.documentDescription').text();
        
        var productML = $(this).find('article.tileItem:nth-child(1) > div:nth-child(1) > h2:nth-child(1) > a:nth-child(1)').text();

        // Verifica se a url já existe
        modelProducts.findOne({where: { productML }})
          .then((product) => {
            if(product == null) {

              let newProduct = {
                productML, url, name
              };

              modelProducts.create(newProduct);
            }
          })

          modelProducts.findOne({where: { productML }})

          .then((productUpdate) => {
            
            modelAltera.findOne({where: {productML}})
            .then((alteracao)=>{

              console.log('tb alteracao',alteracao.name)
              console.log('tb produto',productUpdate.name)

              if(productUpdate.name !== alteracao.name){
                  let atualiza = {
                productML, url, name
              };

              modelAltera.create(atualiza);

              return new Promise((resolve, reject) => {
                modelProducts.findOne({ where: { id } })
                  .then(urlScraped => {
            
                    urlScraped.productML = productML;
                    urlScraped.save();
            
                    resolve();
                  })
                  .catch(err => {
                    reject(err);
                  });
              });
            

              }

            })

          })

      });

        // // Percorre a lista de páginas para salvar os links futuros
        // $('.pagination__container > ul > li').each(function(){
        //   const url = $(this).find('a').attr('href');

        //   if(url != '#') {
        //     modelPages.findOrCreate({ where: { url } });
        //   }
        // });

        resolve();
      })
      .catch((err) => {
        reject(err);
      })
  })
}

async function main() {
  try {
    const pagesToScrape = await getUrlsToScrape(3);

    if (pagesToScrape.length > 0) {
      for (let index = 0; index < pagesToScrape.length; index++) {
        const page = pagesToScrape[index];
        console.log(page.url)
        await requestBody(page.url);
        await updatePageScraped(page.id);
        console.log('Página lida com sucesso.\n');
      }

    } else {
      console.log('Não existem novas urls disponíveis.\n')
    }
  } catch (error) {
    console.log(error);
  }
}

interval(async () => {
  await main()
}, 10000)