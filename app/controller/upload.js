'use strict';

const fs = require('fs');
const moment = require('moment');
const mkdirp = require('mkdirp'); // 新建文件夹
const path = require('path');

const Controller = require('egg').Controller;

class UploadController extends Controller {
  async upload() {
    const { ctx } = this;
    // 需要前往 config/config.default.js 设置 config.multipart 的 mode 属性为 file
    const file = await ctx.request.files[0];

    // 声明存放资源的路径
    let uploadDir = '';
    try {
      // ctx.request.files[0] 表示获取第一个文件，若前端上传多个文件则可以遍历这个数组对象
      const f = fs.readFileSync(file.filepath);// 读取文件，保存在 f 变量中
      // 1.获取当前日期
      const day = moment(new Date()).format('YYYYMMDD');
      // 2.创建图片保存的路径,,uploadDir已在config中声明
      const dir = path.join(this.config.uploadDir, day);
      const date = Date.now(); // 毫秒数
      await mkdirp(dir); // mkdirp方法不存在就会创建目录，如果存在就不会重新创建
      // 返回图片保存的路径
      uploadDir = path.join(dir, date + path.extname(file.filename));
      // 写入文件夹
      fs.writeFileSync(uploadDir, f);
    } finally {
      // 清除临时文件
      ctx.cleanupRequestFiles();
    }

    ctx.body = {
      code: 200,
      msg: '上传成功',
      //   这里要注意的是，需要将 app 去除，因为我们在前端访问路径的时候，是不需要 app 这个路径的，比如我们项目启动的是 7001 端口，最后我们访问的文件路径是这样的 http://localhost:7001/public/upload/20210521/1621564997310.jpeg。
      data: uploadDir.replace(/app/g, ''),
    };
  }

}

module.exports = UploadController;
