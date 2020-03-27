---
title: 'Fields filter'
lang: en
keywords: LoopBack 4.0, LoopBack 4, fields
layout: readme
source: loopback-next
file: packages/metadata/README.md
sidebar: lb4_sidebar
permalink: /doc/en/lb4/Fields-filter.html
---

A _fields_ filter specifies properties (fields) to include or exclude from the results.

### REST API


**The <true|false> does not work for url as the boolean is being concerted to string, which is always trru**
<pre>
filter[fields][<i>propertyName</i>]=<true>&filter[fields][<i>propertyName</i>]=<true>...
</pre>

Note that to include more than one field in REST, use multiple filters.

You can also use [stringified JSON format](Querying-data.html#using-stringified-json-in-rest-queries) in a REST query.

### Node API

{% include content/angular-methods-caveat.html lang=page.lang %}

<pre>
{ fields: {<i>propertyName</i>: <true|false>, <i>propertyName</i>: <true|false>, ... } }
</pre>

Where:

* _propertyName_ is the name of the property (field) to include or exclude.
* `<true|false>` signifies either `true` or `false` Boolean literal. Use `true` to include the property or `false` to exclude it from results.

By default, queries return all model properties in results. However, if you specify at least one fields filter with a value of `true`,
then by default the query will include **only** those you specifically include with filters.

### Examples

Return customer information only with `name` and `address`, and hide their `id`:

**REST**

**<false> does not wort in url for now as it is converted to string**
should be:
`/customers?filter[fields][id]=false&filter[fields][name]=true&filter[fields][address]=true`
But now is:
`/customers?filter[fields][name]=true&filter[fields][address]=true`

{% include code-caption.html content="Node API" %}
```ts
await customerRepository.find({fields: {id: false, name: true, address: true}});
```

Returns:

```ts
[
  {
    name: 'Mario',
    address: '8200 Warden Ave'
  }, 
  {
    name: 'Luigi',
    address: '999 Avenue Rd'
  },
  ...
]
```

Exclude the `vin` property:

**REST**

**Does not work for url for now**
// `/user?filter[fields][password]=false`

{% include code-caption.html content="Node API" %}
```ts
await UserRepository.find({fields: {password: false}});
```

Notice that `fields` clause is to include/exclude the result from the **database**, e.g if you would like to check `password` for users, the above example would fail as `password` is undefined. If you need the property and also want to hide it from the response, set the [hidden properties](Model.md#hidden-properties) in the model definition might help.