import { setDefaultStateKit, ServiceStateBuilder, Api, StateListener, CardsContainer, Wrapper, QueryBuilder } from "morabaa-services";
import React from "react";
import { JsonBuilder } from "morabaa-utils";
import Service from "./Service";
import { Client } from "../../MainClient";

const TestView = () => {
  const service = React.useMemo(() => new Service(), []);
  const queryBuilder = new QueryBuilder({ onQueryChange: service.setQueryParams });
  return (
    <Wrapper service={service}>
      <CardsContainer stateName="data" service={service} itemBuilder={({ item }: any) => <JsonBuilder json={item} />} />
      {/* <StateListener
        name="items"
        service={service}
        Component={({ items }) => {
          return items.map((item: any) => <p key={item.id}>{item.name}</p>);
        }}
      /> */}
      {/* <CardsContainer stateName="items" service={service} itemBuilder={({ item }: any) => <JsonBuilder json={item} />} /> */}
    </Wrapper>
  );
};
export default TestView;

// export const ItemBuilder = ({ item, service, title }: any) => {
//   return (
//     <div
//       onClick={(e) => {
//         service.showUpdateItem(item);
//       }}
//       className=" overflow-hidden text-black">
//       {/* <p>{JSON.stringify(item)}</p> */}
//       <p>{item.name}</p>
//       <p>{title}</p>
//     </div>
//   );

// const Actions = ({ service }: any) => {
//   const [name, setName] = React.useState("ali");

//   return (
//     <div className="col gap-l p-l round-l bg-king">
//       <div className="row gap-2x ">
//         <p
//           onClick={() => {
//             service.setHeader([
//               { id: "name", value: name, title: "name" },
//               { id: "isDeleted", value: false, title: "name" },
//             ]);
//           }}>
//           testHeader
//         </p>
//         <p
//           className="button"
//           onClick={() => {
//             service.setQueryParmas([
//               { id: "name", value: name, title: "name" },
//               { id: "isDeleted", value: false, title: "name" },
//             ]);
//           }}>
//           load
//         </p>
//         <p
//           className="button"
//           onClick={() => {
//             service.loadMore();
//           }}>
//           loadMore
//         </p>

//         <p
//           className="button"
//           onClick={() => {
//             service.updateItem({ id: 1, name: "ali" });
//           }}>
//           updateItem
//         </p>

//         <p
//           className="button bg-green"
//           onClick={() => {
//             service.updateQueryParams({
//               id: "name",
//               value: name,
//               title: "name",
//             });
//           }}>
//           update query
//         </p>
//       </div>
//       <input value={name} onChange={(e) => setName(e.target.value)} />
//     </div>
//   );
// };
// interface StateBuilderTestProps {
//   service: ITestService;
//   label?: string;
// }

// export const kit = {
//   MAHMOSE: () => <div>amMahomse</div>,
//   Headyer: () => <div>amHeadyer</div>,
//   ALI: () => <div>amHeadyer</div>,
// };
// export type kitKeys = keyof typeof kit;
// setDefaultStateKit(kit);
