// 为了方便处理静态资源，所以我们把所有静态资源放在public目录中

var http = require('http')
var fs = require('fs')
var template = require('art-template')
var url = require('url')

var comments = [
    {name:"阿萨德",message:'jasdhjsdfashjd',datetime: '12-12-12'},
    {name:"人防",message:'jassdfdhjsdfashjd',datetime: '12-12-12'},
    {name:"为",message:'jasdhjasdfshjd',datetime: '12-12-12'},
    {name:"大锅饭",message:'jasdhasdjashjd',datetime: '12-12-12'},
]


// http://127.0.0.1:3000/pinglun?name=%E7%9C%9F%E6%98%AF%E7%9A%84&message=%E9%98%BF%E8%90%A8%E5%BE%B7%E9%98%BF%E8%90%A8%E5%BE%B7
// 对于这种表单提交的请求路径，由于用户动态填写的内容，所以只需判断/pinglun


// var serrver = http.createServer()

// server.on('request',function(req,res){

// })

// server.listen(3000,function(){

// })
// 简写方式

http
.createServer(function(req,res){
    var parseObj = url.parse(req.url,true)
    
    //改路径不包含？以后的参数
    var pathname = parseObj.pathname

    if(pathname === '/'){
        fs.readFile('./view/index.html',function(error,data){
            if(error){
                return res.end("404 NOT FOUND")
            }
            data = template.render(data.toString(),{
                comments:comments
            })
            res.end(data)
        })
    }
    else if(pathname == '/post'){
        fs.readFile('./view/post.html',function(error,data){
            if(error){
                return res.end("404 Not Found")
            }
            res.end(data)
        })
    }
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
    else{
        fs.readFile('./view/404.html',function(error,data){
            if(error){
                return res.end('404 Not Found')
            }
            res.end(data)
        })
    }
})
.listen(3000,function(){
    console.log("running...请打开 http://127.0.0.1:3000/ 查看")
})