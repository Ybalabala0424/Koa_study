const Koa=require('koa');
const app=new Koa();
const router=require('koa-router')();
const request=require('request');
const mysql=require('mysql');
const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database: 'register_koa'
});
async function getRequest(name){
    const url="http://v.juhe.cn/weather/index?cityname="+name+"&dtype=&format=&key=15448dc543b57c3eb503a23803f3eb6d";
    let result=await request(url,function (error,response,data) {
        if(!error&&response.statusCode===200){
            let chart=JSON.parse(data);
            return chart;
        }else{
            return;
        }
    });
    // console.log(result);
    return result;
}
const report=async (ctx)=>{
    let geturl=ctx.originalUrl;
    // console.log(geturl);
    let array=geturl.split('=');
    let name=array[1];
    // console.log(name);
    let chart=await getRequest(name);
    // console.log(chart);
    ctx.body=chart;
};
const register=async (ctx)=>{
    let userid=ctx.query.userid;
    let password=ctx.query.password;
    connection.connect();
    let sql="insert into message VALUES ("+userid+","+password+");";
    // console.log(sql);
    let result=await connection.query(sql,function (err) {
        if (err){
            throw err;
        }
    });
    connection.end();
    // console.log(result);
    ctx.body=result.toString();
};
const calculator=async function (ctx) {
    let str=ctx.query.str.toString();
    // console.log(str);
    const finalStr=str.replace(' ','+');
    const result=eval(finalStr).toString();
    // console.log(result);
    ctx.body=finalStr+"="+result;
};
const check=async (ctx,next)=>{
    let list={};
    let time=new Date().toLocaleString();
    // console.log(time);
    let url=ctx.request.href;
    // console.log(url);
    let query=ctx.request.query;
    // console.log(query);
    list.time=time;
    list.url=url;
    list.query=query;
    ctx.body=list;
    await next();
};
app.use(router['routes']()).use(router.allowedMethods());
app.use(check);
// check();
router.get('/report',report);
router.get('/register',register);
router.get('/cal',calculator);
module.exports=router;
app.listen(3000);
