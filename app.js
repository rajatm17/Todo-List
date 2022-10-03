//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");



const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rajat:rajat@cluster0.roxqx.mongodb.net/todolistDB");

const itemsSchema = {
  name: {
    type: String,
    required: [true, "Cannot be empty!"]
  }
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "welcome to your todolist"
});

const item2 = new Item({
  name: "Press + to add item in your todolist"
});

const item3 = new Item({
  name: "<<<--- Press this to delete item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {


  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          // console.log("items are added successfully");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });



});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const titleName = req.body.list;

  const item = new Item({
    name: itemName
  });
if(titleName==="Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name:titleName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+titleName);
  });
}



});

app.post("/delete", function(req, res) {
  const idname = req.body.checkbox;
const listName = req.body.list;

if(listName === "Today"){
  Item.findByIdAndRemove(idname, function(err) {
    if (!err) {
      console.log("Item is removed successfully");
      res.redirect("/");
    }

  });
}else{
  List.findOneAndUpdate({name : listName},{$pull:{ items:{_id: idname}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }
  });
}


});

app.get("/:customListName", function(req, res) {
  const customListName = req.params.customListName;

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    console.log(foundList);
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
    }
  });



});


app.listen(process.env.PORT ||3000);