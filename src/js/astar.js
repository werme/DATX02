'use strict';

Darwinator.AStar = function(grid, diagonals)
{
	// Approx value for square root of 2.
	this.DIAGONALCOST = 1.41421356;
    /* Cost for turning. Small enough that a shorter path is always prefered, but
     * still enough to be sure that out of several equally long paths, the one with
     * the fewest turns will be chosen. */
	this.TURNCOST = 0.0002;
    this.nodes = [];
    for(var i = 0; i < grid.length; i++)
    {
        this.nodes[i] = [];
        for(var l = 0; l < grid[i].length; l++)
        {
            this.nodes[i][l] = new Darwinator.AStar.Node(i, l, grid[i][l]);
        }
    }

    /* Set neighbors of every walkable node */

    for(i = 0; i < this.nodes.length; i++)
    {
        for(l = 0; l < this.nodes[i].length; l++)
        {
            if(this.nodes[i][l].walkable())
            {
                this.nodes[i][l].findNeighbors(this.nodes, diagonals);
            }
        }
    }
};

Darwinator.AStar.prototype.init = function()
{
    for(var i = 0; i < this.nodes.length; i++)
    {
        for(var l = 0; l < this.nodes[i].length; l++)
        {
            var node = this.nodes[i][l];
            node.closed    = false;
            node.open      = false;
            node.parent    = null;
            node.totalCost = 0;
            node.estimate  = 0;
            node.score     = 0;
        }
    }
};

Darwinator.AStar.prototype.findPath = function(start, stop)
{
	if (start.x === stop.x && start.y === stop.y)
	{
		return [];
	}
    this.init();
    var open = this.heap();

    var current = this.nodes[start.x][start.y];
    var end = this.nodes[stop.x][stop.y];
    current.estimate = Darwinator.Helpers.calculateDistance(current, stop);

    open.push(current);

    while(!open.isEmpty())
    {
        /* Try the node with the lowest found score */
        current = open.pop();
        /* Check if stop is found */
        if(current === end)
        {
            return current.traversePath();
        }

        /* Mark current as closed, add currents neighbors list of candidates */
        current.closed = true;
        var neighbors = current.neighbors;

        for(var i = 0; i < neighbors.length; i++)
        {
            var neighbor = neighbors[i];
            /* If neighbor is already checked, skip it */
            if(neighbor.closed)
            {
                continue;
            }

            var cost = current.totalCost + current.isDiagonal(neighbor) ? this.DIAGONALCOST : 1;
            var visited = neighbor.open;

            /* Found new optimal path to the neighbor */
            if (!visited || cost < neighbor.totalCost)
            {
                neighbor.open = true;
                neighbor.parent = current;
                neighbor.estimate = neighbor.estimate || Darwinator.Helpers.calculateDistance(neighbor, stop);
                neighbor.totalCost = cost;
                neighbor.score = neighbor.totalCost + neighbor.estimate;
            }
            /* If node had not been visited, add it to candidates. */
            if (!visited)
            {
                open.push(neighbor);
            }
            /* If node had not been visited, its score needs to be updated for new path */
            else
            {
                open.rescoreElement(neighbor);
            }
        }
    }
    /* No path was found */
    return [];
};

Darwinator.AStar.prototype.heap = function()
{
    return new Darwinator.BinaryHeap(function(node) {
        return node.score;
    });
};

Darwinator.AStar.Node = function(x, y, index)
{
    this.x = x;
    this.y = y;
    this.closed = false;
    this.open   = false;
    this.neighbors = [];
    this.index = index;
    this.parent = null;
    this.totalCost = 0;
    this.estimate  = 0;
    this.score     = 0;
};

Darwinator.AStar.Node.prototype.walkable = function()
{
	return this.index === 0;
};

Darwinator.AStar.Node.prototype.traversePath = function()
{
    var curr = this;
    var path = [];
	path.push(curr);
    while(curr.parent)
    {
        path.push(curr.parent);
        curr = curr.parent;
    }
    return path.reverse();
};

Darwinator.AStar.Node.prototype.isDiagonal = function(node)
{
    return (this.x !== node.x && this.y !== node.y);
};

Darwinator.AStar.Node.prototype.addNeighbor = function(node)
{
    this.neighbors.push(node);
};

Darwinator.AStar.Node.prototype.isReachable = function(grid, considered)
{
    if (!considered.walkable())
        return false;

	return (grid[this.x][considered.y].walkable() && grid[considered.x][this.y].walkable());
};

Darwinator.AStar.Node.prototype.findNeighbors = function(grid, diagonals)
{
	var x = this.x;
	var y = this.y;
	var xi = 0;
	var yi = 0;

	for(var i = 0; i < 9; i++)
	{
		xi = (i % 3) - 1;
		yi = Math.round((i / 3)) - 1;
		var badDiagonal = x + xi !== x && y + yi !== y && !diagonals;
		var outOfBounds = !grid[x + xi] || !grid[x + xi][y + yi];
		if (badDiagonal || outOfBounds)
		{
			continue;
		}
		var node = grid[x + xi][y + yi];
		if (node.isReachable(grid, this))
		{
			this.addNeighbor(node);
		}
	}
};
