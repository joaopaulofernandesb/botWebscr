import Sequelize from 'sequelize';
import path from 'path';

let database = null;

const loadModels = (sequelize) => {
  const dir = path.join(__dirname, './../models/');
  const models = [];

  const filePages = path.join(dir, 'pages');
  const fileProducts = path.join(dir, 'products');
  const fileAlteracao= path.join(dir, 'alteracao');
  
  const modelPages = sequelize.import(filePages);
  const modelProducts = sequelize.import(fileProducts);
  const modelAlteracao= sequelize.import(fileAlteracao);

  models[modelPages.name] = modelPages;
  models[modelProducts.name] = modelProducts;
  models[modelAlteracao.name] = modelAlteracao;

  return models;
};

export default (config) => {
  if (!database) {
    const op = Sequelize.Op;
    const sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      {
        host: config.params.host,
        dialect: config.params.dialect,
        operatorsAliases: op,
        logging: false,
      },
    );

    database = {
      sequelize,
      Sequelize,
      models: {},
    };

    database.models = loadModels(sequelize);

    sequelize.sync().done(() => database);
  }

  return database;
};
