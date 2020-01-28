import express from 'express';
import mongoose from 'mongoose';
import { mongoURI } from './config/config';
import bodyParser from 'body-parser';
import auth from './routes/auth';
import userApi from './routes/user-panel.api';
import passport from './config/passport';

let app = express();

let port = process.env.PORT || 3000;

passport();

app.use((req,res,next)=>{
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader(
        'Access-control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

app.get('/', (req, res) => {
    res.send('<script>var r=new Date().valueOf() + ( ' + (new Date().getTimezoneOffset()) +
        ' - (new Date().getTimezoneOffset()) ) * -60000;' +
        'setInterval(()=>{document.body.innerHTML = (new Date(r+=1000)).toLocaleString("en",{weekday:"long", month:"long", day:"numeric", year:"numeric", hour:"numeric", minute:"numeric", second:"numeric", hour12:false})},1000);' +
        '</script>');
});

app.get('/serverTime', (req,res) => {
    let date = new Date(Date.now()).toISOString();
    res.status(200).json({
         date,
    })
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
 

mongoose.connect(mongoURI, {useNewUrlParser: true});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true)


app.use('/api/auth', auth());
app.use('/api', userApi());


app.listen(port);


app.get('/', (req, res) => {
    // kod wykonany po wysłaniu zapytania get pod "/"
});



