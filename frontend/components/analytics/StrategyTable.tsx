interface Strategy {
  strategy: string;
  trades: number;
  profit: number;
}

export default function StrategyTable({
  data,
}: {
  data: Strategy[];
}) {
  return (
    <div className="bg-white p-4 rounded-lg border shadow">
      <h2 className="text-lg font-semibold mb-4">
        Strategy Performance
      </h2>

      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Strategy</th>
            <th className="text-left">Trades</th>
            <th className="text-left">Profit</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.strategy}>
              <td>{item.strategy}</td>
              <td>{item.trades}</td>
              <td>{item.profit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}