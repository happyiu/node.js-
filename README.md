# `留言评论 实现思路`

1. 前期准备，构建文件夹
   
   1.1 文件根路径下 app.js 作为 node.js 文件解析的入口

   1.2 public 存放 静态资源，比如css，js，第三方包
    - 开放 public 目录中的静态资源，当请求/public/xxx 时，读取响应public目录的具体资源(`即：请求的url是什么，读取文件的路径就是什么（注意：处理路径的格式），这样便于处理判断`)

   1.3 view 存放网页页面，暂时包括了（index.html post.html 404.html）
    - 进入网站后，首先为index.html，存有评论留言的首页
      - 因为index.html里还会请求样式文件，所以将请求的url地址改为/public/文件名
    - 点击首页留言，进入post.html 评论留言
    - 输入留言内容提交后，跳转去首页
    - 如果请求的url找不到目录下的文件，就显示 404.html 页面 

2. 准备好评论留言的首页

3. 功能实现步骤

  0. 引入需要的模块
  ```js
  // 核心模块
  var http = require('http')    //创建HTTP 服务器和客户端
  var fs = require('fs')    //文件系统
  var url = require('url')  //用于处理与解析 URL

  // 第三方模块
  var template = require('art-template')  // 模板渲染
  
  ```

  1. 创建server
  ```js
  // var serrver = http.createServer()
  // server.on('request',function(req,res){
  // })
  // server.listen(3000,function(){
  // })
  // 以下为简写方式
  http.createServer(function(){

  }).listen(3000,function(){

  })
  ```

  2. 进入网站后，首先为index.html存有评论留言的首页，网站向后台发送请求，后台来判断请求路径，来响应不同的资源
  ```js
  http
  .createServer(function(req,res){
      // url.parse(req.url,true) 是解析url地址，将得到的对象给parseObj
      var parseObj = url.parse(req.url,true)
      
      // url.parse(req.url,true)解析出来有个属性为 pathname ，这个属性是url地址，不带？后面的参数，这里将 pathname取出，来判断请求路径
      var pathname = parseObj.pathname

      // 判断请求路径否为 根路径
      if(pathname === '/'){
          // 若是，则读取文件 index.html
          // fs.readFile('文件路径',回调函数(error,data){}) 回调函数里第二个参数data是二进制
          fs.readFile('./view/index.html',function(error,data){
              if(error){
                  // 找不到文件，就返回 输出 404，结束操作
                  return res.end("404 NOT FOUND")
              }
              // 若找到首页文件，则使用 模板渲染，将评论数据渲染到首页后，再发送响应
              // template.render(模板页面，{替换的数据})
              // 由于 data为二进制，要先转化为字符串，再去渲染
              data = template.render(data.toString(),{
                  comments:comments
              })
              // 服务端渲染好后，发送渲染好的网页到客户端
              res.end(data)
          })
      }
      else if(pathname.indexOf('/public/') === 0){
        // 对于静态资源，统一处理’
        // 如果请求路径是以 /public/ 开头，则获取public文件夹里某个资源，所以直接将请求路径作为文件路径来读取
        fs.readFile('.'+ pathname,function(error,data){
            if(error){
                return res.end("404")
            }
            res.end(data)
        })
    }
  })
  .listen(3000,function(){
      console.log("running...请打开 http://127.0.0.1:3000/ 查看")
  })  
  ```

  3. 如果点击评论留言，进入 post.html 页面
  - post.html 页面表单
  ```html
  <!-- 表示提交后跳转的地址 -->
  <form action="/pinglun" method="get">
      <div class="form-group">
        <label for="input_name">你的大名</label>
        <!-- 要提交的信息要用name -->
        <input type="text" class="form-control" required minlength="2" maxlength="10" id="input_name" name="name" placeholder="请写入你的姓名">
      </div>
      <div class="form-group">
        <label for="textarea_message">留言内容</label>
        <textarea class="form-control" name="message" id="textarea_message" cols="30" rows="10" required minlength="5" maxlength="20"></textarea>
      </div>
      <button type="submit" class="btn btn-default">发表</button>
    </form>
  ```

  ```js
  else if(pathname == '/post'){
        fs.readFile('./view/post.html',function(error,data){
            if(error){
                return res.end("404 Not Found")
            }
            res.end(data)
        })
    }
  ```

  4. 点击提交评论留言后，跳转到 /pinglun?name=......,后台取出？后面的数据，然后处理拼接上首页的评论。跳转首页的方法为：重定向。
  - 具体方法：设置响应状态 res.statusCode = 302，
  - 然后设置响应头来处理跳转：res.setHeader('Location','/')
  - 最后 res.end() 来结束响应
  ```js
  else if(pathname == '/pinglun'){
        var plobj = {}
        plobj = parseObj.query
        plobj.datetime = '21-55-21'
        comments.unshift(plobj)
        // 重定向 ， 跳转到首页
        // 状态码设置为 302 临时重定向  statusCode
        // 在响应中通过Location告诉客户端往首页重定向
        res.statusCode = 302
        res.setHeader('Location','/')
        res.end()
    }
  ```



# 服务端渲染 和 客户端渲染
这里结合art-template模板引擎说明。

首先了解下前端页面中如何使用art-template

1、script 标签导入包，当这个标签导入完毕后，在window全局中就有了template 函数。

2、创建一个script标签，内部是模板字符串
```js
<script type="text/template" id="tmpl">
```
3、 var htmlStr = template('tmpl',{要渲染的数据对象})

4、将创建好的HTML字符串，追加到页面中即可

重点来啦！

## 1、服务器端渲染

每当有客户端请求页面了，服务器先在后端调用art-template，把指定的页面预先在后端渲染后，然后通过res.end把这个渲染完毕的完整页面，

返回给客户端直接展示。

 优点：对SEO友好，因为我们经过服务器端渲染的页面，在网络中传输的时候，传输的是一个真实的页面。因此，爬虫客户端，当爬到我们的页面后，

会分系我们给他提供的这个页面，此时，我们页面中的关键数据就会被爬虫给收录了。

缺点： 服务器端渲染，对服务器压力比较打，可以使用服务器端的页面缓存技术，减轻服务器的渲染压力；不适合前后端分离开发。

 
## 2、客户端渲染

每当用户要请求某个页面了，

第一步，用户需要先把这个页面请求到客户端，此时用户拿到的页面只是一个模板页面。

第二步，浏览器在解析模板页面的时候，会发起art-template的二次资源请求，同时要发送Ajax请求，去服务器获取数据

第三步，在客户端调用art-template 渲染HTML结构，并把渲染厚的htmlStr append 到页面指定的容器中;

缺点： 对SEO相当不友好

优点： 减轻了服务器端的渲染压力;同时，最大的好处就是：能够实现前后端分离开发;

## 各自应用的场景：

1、当不需要对 SEO友好的时候，推荐使用客户端渲染;

2、当需要对 SEO友好的时候，推荐使用服务器端渲染;

比如 京东的商品列表就是服务端渲染，商品评论是客户端渲染
