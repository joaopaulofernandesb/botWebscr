export default (sequelize, DataType) => {
    const Alteracao = sequelize.define(
      'alteracao', {
        id: {
          type: DataType.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        productML: {
          type: DataType.TEXT,
          required: true,
        },
        name: {
          type: DataType.TEXT,
          required: true,
        },
        url: {
          type: DataType.TEXT,
          required: true,
        },
      },
      {
        tableName: 'alteracao',
      },
    );
  
    return Alteracao;
  };
  