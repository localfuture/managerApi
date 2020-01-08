const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

app.get('/', (req, res) => {
    res.send('<h1>Your manager is here!</h1>');
});

app.listen(process.env.PORT || 3000, () => {
    console.log("server is up and running @PORT 3000");
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//DataBase Connection
// mongoose.connect('mongodb://localhost:27017/managerDb', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
//     .then(data => {
//         console.log('connected to DB!');
//     })
//     .catch(error => {
//         console.log('Failed!! : ', error);
//     });

//DataBase Connection
mongoose.connect("mongodb+srv://anand:unicornb1331@cluster0-0tquo.mongodb.net/managerDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
    .then(() => {
        console.log("Connected to DataBase");
    })
    .catch(() => {
        console.log("Connection Failed!!!");
    });

//CROS Error//
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8100');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//Expense Schema
const expenseSchema = mongoose.Schema({
    date: Number,
    month: Number,
    year: Number,
    todaysDate: { 
        type: Date, 
        default: Date.now 
    },
    todaysExpense: [{
        expense: {
            type: String,
            required: true
        }, cost: {
            type: Number,
            required: true
        }
    }],
    total: {
        type: Number,
        default: 0
    }
});

//Expense Collection
var expenseCollection = mongoose.model('expenseCollections', expenseSchema);


app.post('/addExpense', (req, res) => {

    var today = new Date();
    var id;

    expenseCollection.find({ date: today.getDate(), month: today.getMonth(), year: today.getFullYear() })
        .then(resp => {
            console.log('find data from DB : ', resp);
            console.log("length of array : ", resp.length);
            if (resp.length == 0) {
                const expense = new expenseCollection({
                    date: today.getDate(),
                    month: today.getMonth(),
                    year: today.getFullYear(),
                    todaysDate: new Date(),
                    todaysExpense: [{
                        expense: req.body.expense,
                        cost: req.body.cost
                    }]
                });

                expense.save()
                    .then(resp => {
                        console.log(resp);

                        expenseCollection.updateOne({date: today.getDate(), month: today.getMonth(), year: today.getFullYear()}, {$inc:{total: req.body.cost}})
                        .then(resp => {
                            console.log('updated todays expense : ', resp);
                            res.status(201).json("Updated today's expense!");
    
                        })
                        .catch(error => {
                            console.log("error in updating today's expense!", error);
                            res.status(500).json('error adding expense!');
                        })
                    })
                    .catch(error => {
                        console.log(error);
                        //res.status(500).json('error adding expense!');
                    });

            } else {
                expenseCollection.updateOne({date: today.getDate(), month: today.getMonth(), year: today.getFullYear()}, {$addToSet: {todaysExpense: req.body}, $inc:{total: req.body.cost}})
                    .then(resp => {
                        console.log('updated todays expense : ', resp);
                        // res.status(201).json("Updated today's expense!");

                    })
                    .catch(error => {
                        console.log("error in updating today's expense!", error);
                        // res.status(500).json('error adding expense!');
                    })
            }
            return;
        })
        .catch(error => {
            console.log(error);
            res.status(500).json('error adding expense!');
        });
});

app.get('/fetchExpense', (req, res) => {

    var today = new Date();
    
    expenseCollection.findOne({date: today.getDate(), month: today.getMonth(), year: today.getFullYear()})
        .then(data => {
            console.log("data fetched: ", data);
            res.status(201).send(data);
        })
        .catch(error => {
            console.log(error);
            res.status(500).json('error fetching data');
        });
});

app.delete('/deleteExpense/:id', (req, res) => {
    expenseCollection.deleteOne({ _id: req.params.id })
        .then(resp => {
            console.log("deleted resp : ", resp);
            // res.status(201).json('deleted successfully');
        })
        .catch(error => {
            console.log('error in deleting', error);
        });
});

app.put('/updateExpense/:id', (req, res) => {
    expenseCollection.updateOne({ _id: req.params.id }, req.body)
        .then(resp => {
            console.log('updated : ', resp);
            // res.status(201).json('updated successfully!');
        })
        .catch(error => {
            console.log('error in updation : ', error);
            // res.status(500).json('Updation failed!');
        })
});







