import axios from "axios";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
  BarChart,
} from "recharts";

interface Props {
  active: boolean;
  payload: any;
}

export const CustomTooltip = (props: Props) => {
  const { active, payload } = props;
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        {payload.map((pld: any) => (
          <div style={{ display: "inline-block", padding: 10 }}>
            <div>{pld.value}</div>
            <div>{pld.dataKey}</div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default function App() {
  const [status, setStatus] = useState(0);
  const [data, setData] = useState<any>(null);
  const [data1, setData1] = useState<any>(null);
  const getData = async () => {
    let _data = await axios.get(
      `https://snapmeter.com/api/public/meters/2080448990211/readings?start=2022-08-01&end=2023-02-01`,
      {
        headers: {
          Authorization: "4f981c43-bf28-404c-ba22-461b5979b359",
        },
      }
    );


    let kw = _data.data.data[0].attributes.readings.kw;
    let kws = [];
    let startTime = new Date("2022-08-01T00:00:00.000Z").getTime();
    let endTime = new Date("2023-02-01T00:00:00.000Z").getTime();

    for (let i = startTime; i < endTime; i += 15 * 60 * 1000) {
      let dateStr = new Date(i).toISOString().split(".")[0];
      let _key = dateStr.split("-");
      kws.push({
        month: _key[0] + "-" + _key[1],
        timestamp: new Date(dateStr).getTime(),
        kw: kw[dateStr + "-07:00"] || 0,
      });
    }
    setData(kws);

    let _data1 = await axios.get(
      `https://snapmeter.com/api/public/services/2080448990210/bills?start=2022-01-01&end=2023-02-01`,
      {
        headers: {
          Authorization: "4f981c43-bf28-404c-ba22-461b5979b359",
        },
      }
    );
    let costs = [];
    for (let ii = 0; ii < _data1.data.data.length; ii++) {
      costs.push({
        month: _data1.data.data[ii].attributes.start.split('-')[0] + '-' + _data1.data.data[ii].attributes.start.split('-')[1],
        cost: _data1.data.data[ii].attributes.cost
      })
    }
    setData1(costs);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <div>
        <button onClick={() => setStatus(0)}>Show Meter Readings</button>
        <button onClick={() => setStatus(1)}>Show Costs</button>
      </div>
      {status == 0 ? (
        <LineChart
          width={1200}
          height={600}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" interval={96 * 31} />
          <YAxis unit="kw"/>
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="kw" stroke="#82ca9d" activeDot={{ r: 8 }} dot={{r: 1}}/>
        </LineChart>
      ) : (
        <BarChart
          width={1200}
          height={600}
          data={data1}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis unit="$"/>
          <Tooltip />
          <Legend />
          <Bar type="monotone" dataKey="cost" fill="#82ca9d" />
        </BarChart>
      )}
    </>
  );
}
