using System;
using System.Collections.Generic;
using UnityEngine;

[Serializable] public class ExitPoint { public int x, z; public string name; }
[Serializable] public class GridPoint { public int x, z; }
[Serializable] public class BuildingLayout
{
    public int width, height;
    public float cellSize;
    public int[] cells;
    public ExitPoint[] exits;
    public GridPoint spawn;
    public bool Open(int x, int z) => x >= 0 && z >= 0 && x < width && z < height && cells[z * width + x] == 1;
    public Vector3 World(int x, int z) => new Vector3(x * cellSize, 0, z * cellSize);
    public Vector2Int Cell(Vector3 p) => new Vector2Int(Mathf.RoundToInt(p.x / cellSize), Mathf.RoundToInt(p.z / cellSize));
    public List<Vector3> Path(Vector3 from, Vector3 to)
    {
        var a = Cell(from); var b = Cell(to);
        var result = new List<Vector3>();
        if (!Open(a.x, a.y) || !Open(b.x, b.y)) return result;
        int start = a.y * width + a.x, end = b.y * width + b.x;
        var previous = new int[cells.Length];
        for (int i = 0; i < previous.Length; i++) previous[i] = -1;
        var queue = new Queue<int>(); queue.Enqueue(start); previous[start] = start;
        int[] dx = { 1, -1, 0, 0 }, dz = { 0, 0, 1, -1 };
        while (queue.Count > 0 && previous[end] < 0)
        {
            int n = queue.Dequeue();
            for (int d = 0; d < 4; d++)
            {
                int x = n % width + dx[d], z = n / width + dz[d];
                if (!Open(x, z)) continue;
                int next = z * width + x;
                if (previous[next] >= 0) continue;
                previous[next] = n; queue.Enqueue(next);
            }
        }
        if (previous[end] < 0) return result;
        for (int n = end; n != start; n = previous[n]) result.Add(World(n % width, n / width));
        result.Reverse(); return result;
    }
}
