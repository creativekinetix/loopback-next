---
lang: en
title: 'Differences in LoopBack 3 and LoopBack 4 request/response cycle'
keywords: LoopBack 4.0, LoopBack 4, LoopBack 3.0, LoopBack 3
sidebar: lb4_sidebar
permalink: /doc/en/lb4/LB3-vs-LB4-request-response-cycle.html
---

## Differences between LoopBack 3 and LoopBack 4 request/response cycle

The request/response cycle infrastructure and pathway are very different in
LoopBack 3 and LoopBack 4. Knowing the differences will help you migrate
LoopBack 3 apps to LoopBack 4 and implement new request/response related
features in LoopBack 4.

This document will guide you through the differences and show the LoopBack 4
equivalent, if there is any.

### Request/response infrastructure

The difference begins with the LoopBack application object itself. In
LoopBack 3, it is an instance of an Express app; in LoopBack 4, it is not.
Although LoopBack 4 uses Express as the HTTP server, it is not directly exposed
anymore.

In LoopBack 3 you could add routes and load custom middleware using `app.get()`,
`app.post()`, `app.use()`, etc., just like how you do in Express.
In LoopBack 4, you cannot do it anymore. The closest to doing this is to use the
[RestApplication.mountExpressRouter()](https://loopback.io/doc/en/lb4/apidocs.rest.restapplication.mountexpressrouter.html)
API. This API allows you to mount a custom Express router on the LoopBack app.

Using [Controllers](https://loopback.io/doc/en/lb4/Controllers.html) is the
recommended way for creating custom (and REST) endpoints on your app. Its
support for
[dependency injection](https://loopback.io/doc/en/lb4/Dependency-injection.html)
and [Interceptors](https://loopback.io/doc/en/lb4/Interceptors.html) makes it a
very powerful extension mechanism.

In LoopBack 4
[middleware.json](https://loopback.io/doc/en/lb3/middleware.json.html)
is not require anymore because of architectural changes.

In LoopBack 3, models files automatically create the corresponding REST API
endpoints and the database query machinery (using the configured datasource).
In LoopBack 4, model files are limited only to describing the properties of the
data. You will have to create a corresponding
[Repository](https://loopback.io/doc/en/lb4/Repositories.html)
for database connectivity, and controller creating the REST API endpoint.

The fact that you have to create two more artifacts along with the model to
get a REST endpoint working might seem overly tedious at first. However, the
separation of concerns and decoupling the functionality makes the codebase
cleaner, easier to maintain, and much easier to customize functionality at
various levels. This can be better appreciated as the complexity of your app
grows.

For those who are uncomfortable with the concept of having to creating a
repository and a controller for a model, we have a component
[@loopback/rest-crud
](https://loopback.io/doc/en/lb4/Creating-crud-rest-apis.html)
; with a little bit of configuration, a model file is all you will need to
create the REST endpoints. Once your requirements outgrow what
`@loopback/rest-crud` provides, you can implement your REST endpoints the
idiomatic way.

Components are still supported in LoopBack 4, but the concept of component
has completely changed.

In LoopBack 3, a
[component](https://loopback.io/doc/en/lb3/LoopBack-components.html)
is a simple Node.js module which exports a function with the signature
`function(app, options)`. In LoopBack 4, a
[component](https://loopback.io/doc/en/lb4/Creating-components.html)
is a TypeScript class which can add
[servers](https://loopback.io/doc/en/lb4/Server.html),
[observers](https://loopback.io/doc/en/lb4/Life-cycle.html),
[providers](https://loopback.io/doc/en/lb4/Creating-components.html#providers),
and controllers to the app using dependency injection.

A components from LoopBack 3 can be migrated to LoopBack 4 by moving the
functionality to the controller of a LoopBack 4 component.

Because of the architectural changes, `component-config.json` is not required
in LoopBack 4 anymore.

If you used LoopBack 3 boot scripts for adding routes to the app, it
should now be moved to a standalone controller, a component, or implemented
using `app.mountExpressRouter()`.

{% include tip.html content="For details about migrating LoopBack 3 boot scripts
refer to
[Migrating boot scripts](https://loopback.io/doc/en/lb4/migration-boot-scripts.html)
." %}

### Request/response pathway

