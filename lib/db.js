/*
 * @Author: xmgtony 
 * @Date: 2018-02-18 19:46:54 
 * @Description: 创建sequelize对象，
 * 并且定义添加model的通用字段
 * @Last Modified by:    
 * @Last Modified time: 
*/
const dbConfig = require("./dbconfig-loader");
const Sequelize = require("sequelize");

var sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbConfig.port || 3306,
        dialect: dbConfig.dialect || "mysql",
        pool: {
            max: dbConfig.max || 10,
            min: dbConfig.min || 0,
            idle: dbConfig.idle || 3000
        },
        operatorsAliases: dbConfig.operatorsAliases || false
});
//定义model的通用字段，规范制表规范，也就是这几个字段是每个表必须有的
//三个通用字段分别是：id，主键，自增；created，创建时间，时间戳；modified，修改时间，时间戳
const ID_TYPE = Sequelize.BIGINT;

var defineModel = (name,attributes) => {
    let attrs = {};
    for (const key in attributes) {
        let value = attributes[key];
        if(typeof value === "object" && value["type"]) {
            value.allowNull = value.allowNull || false;
            attrs[key] = value;
        } else {
            attrs[key] = {
                type: value,
                allowNull: false
            }
        }
    }
    if (!attributes.id) {
        attrs.id = {
            type: ID_TYPE,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        }
    }
    if(!attributes.created) {
        attrs.created = {
            type: Sequelize.BIGINT,
            allowNull: false
        }
    }
    if(!attributes.modified) {
        attrs.modified = {
            type: Sequelize.BIGINT,
            allowNull: false
        }
    }

    return sequelize.define(name,attrs,{
        tableName: name,
        timestamps: false,
        //添加钩子函数
        hooks: {
            beforeValidate: (obj) => {
                let now = Date.now();
                if (obj.isNewRecord) {
                    obj.created = now;
                    obj.modified = now;
                } else {
                    //修改的时候更改修改时间，一般项目中该字段没有特殊业务要求的时候
                    //会将该字段设置为ON UPDATE CURRENT_TIMESTAMP,但是字段类型要改为timestamp
                    //或者datetime
                    obj.modified = now;
                }
            }
        }
    });
}

const db = {
    defineModel: defineModel,
    sequelize: sequelize,
}
//绑定sequelize的类型到db上
const dataTypes = Sequelize.DataTypes;
for (const dataType in dataTypes) {
  db[dataType] = dataTypes[dataType];
}
module.exports = db;
