export default (sequelize, DataType) => {
  const Products = sequelize.define(
    'products', {
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
      tableName: 'products',
    },
  );

  return Products;
};
