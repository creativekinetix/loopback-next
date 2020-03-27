---
title: 'Limit filter'
lang: en
keywords: LoopBack 4.0, LoopBack 4, limit
layout: readme
source: loopback-next
file: packages/metadata/README.md
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Limit-filter.html
summary: A <i>limit</i> filter specifies a set of logical conditions to match, similar to a LIMIT clause in a SQL query.
---

A _limit_ filter limits the number of records returned to the specified number (or less).

{% include content/angular-methods-caveat.html lang=page.lang %}

### REST API

<pre>
filter[limit]=<i>n</i>
</pre>

You can also use [stringified JSON format](Querying-data.html#using-stringified-json-in-rest-queries) in a REST query.

### Node API

<pre>
{ limit: <i>n</i> }
</pre>

Where _n_ is the maximum number of results (records) to return.

### Examples

Return only the first five query results:

**REST**

`/orders?filter[limit]=5`

{% include code-caption.html content="Node API" %}
```ts
await orderRepository.find({limit: 5});
```
