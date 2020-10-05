const express = require("express");
const router = express.Router();
const Food = require("../db/model/foodModel");
/**
 * @api {post} /food/add 商品添加
 * @apiName 商品添加
 * @apiGroup Food
 *
 * @apiParam {String} name 名称
 * @apiParam {String} price 价格
 * @apiParam {String} desc 描述
 * @apiParam {Number} typeid 分类id
 * @apiParam {String} img 图片
 */
router.post("/add", (req, res) => {
  const { name, price, desc, typeid, img } = req.body;
  Food.find({ name })
    .then((data) => {
      if (data.length === 0) {
        return Food.insertMany({ name, price, desc, typeid, img });
      } else {
        res.send({ code: 500, msg: "商品已存在" });
      }
    })
    .then(() => {
      res.send({ code: 200, msg: "添加成功" });
    })
    .catch(() => {
      res.send({ code: 500, msg: "添加失败" });
    });
});


/**
 * @api {post} /food/del 删除
 * @apiName 删除
 * @apiGroup Food
 *
 * @apiParam {Number} _id id
 */
router.post("/del", (req, res) => {
  const { _id } = req.body;

  Food.remove({ _id })
    .then((data) => {
      res.send({ code: 200, msg: "删除成功" });
    })
    .catch(() => {
      res.send({ code: 500, msg: "删除失败" });
    });
});

/**
 * @api {post} /food/update 商品修改
 * @apiName 商品修改
 * @apiGroup Food
 *
 * @apiParam {String} _id id
 * @apiParam {String} name 名称
 * @apiParam {Number} price 价格
 * @apiParam {String} desc 描述
 * @apiParam {Number} typeid 分类id
 * @apiParam {String} img 图片
 */
router.post("/update", (req, res) => {
  const { _id, name, price, desc, typeid, img } = req.body;
  Food.update({ _id }, { name, price, desc, typeid, img })
    .then(() => {
      res.send({ code: 200, msg: "修改成功" });
    })
    .catch(() => {
      res.send({ code: 500, msg: "修改失败" });
    });
});

/**
 * @api {post} /food/page 商品列表
 * @apiName 商品列表
 * @apiGroup Food
 *
 * @apiParam {Number} pageNo 页数
 * @apiParam {Number} pageSize 条数
 * @apiParam {Number} typeid 分类id
 * @apiParam {Number} key 关键字查询
 */
router.post("/page", (req, res) => {
  const pageNo = Number(req.body.pageNo) || 1;
  const pageSize = Number(req.body.pageSize) || 2;
  const { typeid } = req.body;

  const { key } = req.body;
  const reg = new RegExp(key);
  let query = {};
  if (typeid) {
    query = {
      typeid,
      $or: [{ name: { $regex: reg } }, { desc: { $regex: reg } }],
    };
  } else {
    query = { $or: [{ name: { $regex: reg } }, { desc: { $regex: reg } }] };
  }
  Food.countDocuments(query, (err, count) => {
    if (err) {
      res.send({ code: 500, msg: "商品列表获取失败" });
      return;
    }
    Food.find(query)
      .skip(pageSize * (pageNo - 1))
      .limit(pageSize)
      .then((data) => {
        res.send({
          code: 200,
          data,
          total: count,
          pageNo: pageNo,
          pageSize: pageSize,
          msg: "商品列表获取成功",
        });
      })
      .catch(() => {
        res.send({ code: 500, msg: "商品列表获取失败" });
      });
  });
});

module.exports = router;
