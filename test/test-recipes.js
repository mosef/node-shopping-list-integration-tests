const chai = require("chai");
const chaiHttp = require("chai-http");

const { app, runServer, closeServer } = require("../server");

const should = chai.should();

chai.use(chaiHttp);

describe("recipes", function() {
  before(function() {
    return runServer();
  });
  after(function() {
    return closeServer();
  });

  it("should list recipes on GET", function() {
    return chai
      .request(app)
      .get("/recipes")
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a("array");
        res.body.length.should.be.at.least(1);
        const expectedResults = ["name", "id", "ingredients"];
        res.body.forEach(function(item) {
          item.should.be.a("object");
          item.should.include.keys(expectedResults);
        });
      });
  });

  it("should add a recipe on POST", function() {
    const newRecipe = {
      name: "noodles",
      ingredients: ["eggs", "water", "flour"]
    };
    return chai
      .request(app)
      .post("/recipes")
      .send(newRecipe)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a("object");
        res.body.should.include.keys("id", "name", "ingredients");
        res.body.name.should.equal(newRecipe.name);
        res.body.ingredients.should.be.a("array");
        res.body.ingredients.should.include.members(newRecipe.ingredients);
      });
  });

  it("should update recipes on PUT", function() {
    const updateData = {
      name: "foo",
      ingredients: ["bizz", "bang"]
    };
    return chai
      .request(app)
      .get("/recipes")
      .then(function(res) {
        updateData.id = res.body[0].id;
        return chai
          .request(app)
          .put(`/recipes/${updateData.id}`)
          .send(updateData);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });

  it("should delete recipes on DELETE", function() {
    return chai
      .request(app)
      .get("/recipes")
      .then(function(res) {
        return chai.request(app).delete(`/recipes/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });

  it("should respond with 400", function() {
    const newRecipe = {
      name: "noodles"
    };
    return chai
      .request(app)
      .post("/recipes")
      .send(newRecipe)
      .catch(function(res) {
        res.should.have.status(400);
       
      });
  });
});
