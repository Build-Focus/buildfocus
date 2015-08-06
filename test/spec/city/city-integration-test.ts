define(["knockout", "lodash", "city/city", "city/cell", "city/coord",
        "city/buildings/basic-house", "city/buildings/fancy-house", "city/buildings/building-type"],
  function (ko, _, City, Cell, Coord, BasicHouse, FancyHouse, BuildingType) {
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

        expect(_(potentialBuildings).pluck('coords').flatten().value().sort()).to.deep.equal([
          c(-1, -1), c(0, -1), c(1, -1),
          c(-1, 0),            c(1, 0),
          c(-1, 1),  c(0, 1),  c(1, 1)
        ].sort());
      });
      
      it('should offer to combine two basic houses into one fancy one, but only once', () => {
        var city = new City();
        city.construct(new BasicHouse(c(0, 0)));
        city.construct(new BasicHouse(c(1, 0)));

        var fancyHouseUpgrades = _.where(city.getPossibleUpgrades(), { buildingType: BuildingType.FancyHouse });

        expect(fancyHouseUpgrades.filter(building => _.isEqual(building.coords.sort(), [c(0, 0), c(1, 0)])).length).to.equal(1);
      });

      it('should let you combine two basic houses into one fancy one', () => {
        var city = new City();
        city.construct(new BasicHouse(c(0, 0)));
        city.construct(new BasicHouse(c(1, 0)));

        var fancyBuilding = new FancyHouse(c(0, 0), c(1, 0));
        city.construct(fancyBuilding);

        expect(city.getBuildings()).to.deep.equal([fancyBuilding]);
      });

      it("should not let you build a fancy building if there weren't two basic houses to upgrade", () => {
        var city = new City();

        var fancyBuilding = new FancyHouse(c(0, 0), c(1, 0));

        expect(() => city.construct(fancyBuilding)).to.throw();
      });
    });
  }
);