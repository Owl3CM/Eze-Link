import { ClientService } from "morabaa-services";
import { Client } from "../../API_GENRATED";
import Builder from "../../API_GENRATED/Builder";

Builder.Api.setHeader({
  Authorization: "kqHrOdtZmAOjI8ZC93ftc1bp8GMsire1rXGwf6e8ayESJyUU",
});

// let test = 0;
// Builder.Api.setOnRequest((props) => {
//   test++;
//   if (test > 5) return;
//   console.log(test);

//   console.log("onRequest", { props });

//   //   Functions[id].abort();
// });

// // Builder.Api.setOnError((err) => {
// //   test++;
// //   if (test < 5) err.retry();
// //   console.log({ err });
// // });

// Client.FUCKPagenated.load()
//   .then((res) => {
//     console.log(res);
//   })
//   .catch(async (err) => {
//     console.log(err);
//   });

export default class Service extends ClientService<any> {
  constructor() {
    super({
      client: Client.ItemsOfownerPagenated,
    });
  }
}
