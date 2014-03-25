
describe("Helpers", function() {

    describe(".calculateDistance", function() {

        var calcDist = Darwinator.Helpers.calculateDistance;

        it("calculates diagonals", function() {
            var dist1 = calcDist({ x: 0, y: 0 }, { x: 1, y: 1 });
            var dist2 = calcDist({ x: 1, y: 1 }, { x: 0, y: 0 });
            
            expect(dist1).toBe(dist2);
            expect(dist1).toBe(Math.sqrt(2));
        });

        it("calculates negatives", function() {
            var dist = calcDist({ x: -2, y: -1 }, { x: -1, y: -1 });
            expect(dist).toBe(1);
        });
    });
});
