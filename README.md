# Eze-Link

Eze-Link is a TypeScript package that provides a set of tools for making API requests and managing client-side data caching. It includes an API service, a client builder, and a storable utility.

## Installation

You can install Eze-Link using npm or yarn:

```bash
npm install eze-link
# or
yarn add eze-link
```

## Usage

### API Service

The `ApiService` module provides a set of methods for making API requests. You can create an instance of the API service and use it to make GET, POST, PUT, PATCH, DELETE, and UPDATE requests. Here's an example of how to use it:

```javascript
import { ApiService } from 'eze-link';

const api = ApiService.create({});

api.get({ url: 'https://example.com/api/data' })
  .then(response => {
    // Handle the API response here
  })
  .catch(error => {
    // Handle errors here
  });

```
### Storable

The `Storable` module provides a utility for storing and retrieving data in localStorage, sessionStorage, or memoryStorage. You can use it to cache data on the client-side. Here's an example of how to use it:

```javascript
import { Storable } from 'eze-link';

const storable = new Storable({ storage: 'localStorage' });

storable.set('key', { value: 'data' });

const cachedData = storable.get('key');

console.log(cachedData);  

```

### Client Builder

The `ClientBuilder` class allows you to create client instances with configurable options. You can set options such as API service, data caching, query generation, and more. Here's an example of how to use it:

```javascript
import { ClientBuilder, ApiService } from "eze-link";

const roots = { json: "https://jsonplaceholder.typicode.com" };
const api = ApiService.create({});
const client = new ClientBuilder({ roots, api, storage: "localStorage", storeKey: "test-storeKey" });

const { load, loadMore, reload } = client.OffsetPaginator({
  root: "json",
  url: "/posts",
  getHeaders: (params) => {
    // Customize headers here
    return { Authorization: "Bearer token" };
  },
});

load()
  .then((data) => {
    console.log(data);
    // Handle the data here
  })
  .catch((error) => {
    // Handle errors here
  });
// OR
// loadMore()
//   .then((data) => {
//     console.log(data);
//     // Handle the data here
//   })
//   .catch((error) => {
//     // Handle errors here
//   });

// // OR
// reload()
//   .then((data) => {
//     console.log(data);
//     // Handle the data here
//   })
//   .catch((error) => {
//     // Handle errors here
//   });

```

```javascript
import { ClientBuilder, ApiService } from 'eze-link';

const api = ApiService.create();
const roots={ json: 'https://jsonplaceholder.typicode.com'}
const client = new ClientBuilder({ api, roots });

client.GET_WithCash({ root: 'json', url: '/posts'}) .then(data => {
    console.log(data)
      // Handle the data here
  })
  .catch(error => {
      // Handle errors here
  });

```