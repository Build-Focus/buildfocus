define(["knockout", "lodash", "city/city", "city/cell", "city/coord",
        "city/buildings/basic-house", "city/buildings/nice-house",
        "city/buildings/fancy-house", "city/buildings/buildings",
        "city/buildings/building-type"],
  function (ko, _, City, Cell, Coord, BasicHouse, NiceHouse, FancyHouse,
            Buildings, BuildingType) {
    'use strict';

    function c(x, y) {
      return new Coord(x, y);
    }

    describe('City Integration - City', () => {
      it('should start with one empty cell', () => {
        var city = new City();

        expect(city.getCells().length).to.equal(1);
        expect(city.getBuildings().length).to.equal(0);
      });

      it('should construct provided buildings', () => {
        var city = new City();
        var onlyCoord = city.getCells()[0].coord;

        var building = new BasicHouse(onlyCoord);
        city.construct(building);

        expect(city.getBuildings()).to.deep.equal([building]);
      });

      it('should fire a changed event when constructing buildings', () => {
        var city = new City();
        var onlyCoord = city.getCells()[0].coord;
        var building = new BasicHouse(onlyCoord);
        var listener = sinon.stub();

        city.onChanged(listener);
        city.construct(building);

        expect(listener.calledOnce).to.equal(true);
      });

      it('should let you delete its buildings', () => {
        var city = new City();
        var building = new BasicHouse(city.getCells()[0].coord);
        city.construct(building);

        city.remove(city.getBuildings()[0]);

        expect(city.getBuildings()).to.deep.equal([]);
      });

      it('should fire a changed event when removing buildings', () => {
        var city = new City();
        var building = new BasicHouse(city.getCells()[0].coord);
        city.construct(building);

        var listener = sinon.stub();
        city.onChanged(listener);
        city.remove(city.getBuildings()[0]);

        expect(listener.calledOnce).to.equal(true);
      });

      function asCoords(cells) {
        return _(cells).pluck('coord').map((coord) => [coord.x, coord.y]).value();
      }

      it('should add new surrounding cells after the first building is added', () => {
        var city = new City();
        var onlyCoord = city.getCells()[0].coord;

        city.construct(new BasicHouse(onlyCoord));

        expect(asCoords(city.getCells()).sort()).to.deep.equal([
          [-1, -1], [0, -1], [1, -1],
          [-1, 0],  [0, 0],  [1, 0],
          [-1, 1],  [0, 1],  [1, 1]
        ].sort());
      });

      it('should offer new basic houses on all empty cells', () => {
        var city = new City();
        city.construct(new BasicHouse(c(0, 0)));

        var potentialBuildings = city.getPossibleUpgrades();

        var basicHouseUpgradeCoords = _(potentialBuildings)
                                       .where({buildingType: BuildingType.BasicHouse})
                                       .pluck('coords')
                                       .flatten()
                                       .value()
                                       .sort();
        expect(basicHouseUpgradeCoords).to.deep.equal([
          c(-1, -1), c(0, -1), c(1, -1),
          c(-1, 0),            c(1, 0),
          c(-1, 1),  c(0, 1),  c(1, 1)
        ].sort());
      });

      function buildTwoNiceHouses(city) {
        city.construct(new BasicHouse(c(0, 0)));
        city.construct(new BasicHouse(c(1, 0)));
        city.construct(new NiceHouse(c(0, 0)));
        city.construct(new NiceHouse(c(1, 0)));
      }
      
      it('should offer to combine two nice houses into one fancy one, but only once', () => {
        var city = new City();
        buildTwoNiceHouses(city);

        var fancyHouseUpgrades = _.where(city.getPossibleUpgrades(), { buildingType: BuildingType.FancyHouse });

        expect(fancyHouseUpgrades.filter(building => _.isEqual(building.coords.sort(), [c(0, 0), c(1, 0)])).length).to.equal(1);
      });

      it('should let you combine two nice houses into one fancy one', () => {
        var city = new City();
        buildTwoNiceHouses(city);

        var fancyBuilding = new FancyHouse(c(0, 0), c(1, 0));
        city.construct(fancyBuilding);

        expect(city.getBuildings()).to.deep.equal([fancyBuilding]);
      });

      it("should not let you build a fancy building if there weren't two basic houses to upgrade", () => {
        var city = new City();

        var fancyBuilding = new FancyHouse(c(0, 0), c(1, 0));

        expect(() => city.construct(fancyBuilding)).to.throw();
      });

      it("should successfully serialize every reachable form of building", () => {
        var possibleBuildings = getAllReachableBuildings();

        for (let building of possibleBuildings) {
          expect(Buildings.deserialize(building.serialize())).to.deep.equal(building);
        }
      });

      function getAllReachableBuildings() {
        let unexpanded = [new BasicHouse(c(0, 0))];
        let foundBuildings = [];

        while (unexpanded.length > 0) {
          let building = unexpanded.pop();
          unexpanded = _(unexpanded).concat(building.getPotentialUpgrades())
                                    .unique((building) => building.buildingType)
                                    .reject((building) => _.any(foundBuildings, {buildingType: building.buildingType}))
                                    .value();
          foundBuildings.push(building);
        }

        return foundBuildings;
      }
    });
  }
);