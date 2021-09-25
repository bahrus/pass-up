# pass-up

<a href="https://nodei.co/npm/pass-up/"><img src="https://nodei.co/npm/pass-up.png"></a>

[![Actions Status](https://github.com/bahrus/pass-up/workflows/CI/badge.svg)](https://github.com/bahrus/pass-up/actions?query=workflow%3ACI)

<img src="https://badgen.net/bundlephobia/minzip/pass-up">

pass-up (or p-u for short) is a web component, which, together with [pass-down, or p-d for short](https://github.com/bahrus/pass-down) provides (limited) declarative two-way binding support of web components.

p-u is one member of the [family of web components](https://github.com/bahrus/p-et-alia) that forms a framework for declaratively gluing web components together, using HTML as the preferred mime-type for delivering content.

## Sample Syntax

```html
<div id=target1></div>
<div id=firstLine disabled data-why="There was an old lady who swallowed a fly;">I don't know why she swallowed a fly - Perhaps she'll die!</div>
<p-u on=load to=/target1 prop=textContent init-val=dataset.why></p-u>
<div target2 id=target2></div>
<div id=thirdLine disabled data-spider="There was an old lady who swallowed a spider;"> </div>
<p-u on=click to-nearest-up-match=[target2] prop=textContent val=target.dataset.spider></p-u>
```

## Import Maps

If using a static file web server with no bundling, the following entries are required in your import map:

```html
<script type=importmap>
    {
        "imports": {
            "trans-render/": "../node_modules/trans-render/",
            "on-to-me/": "../node_modules/on-to-me/"
        }
    }
</script>
```

## Viewing Your Element

To view this element locally:

1.  Install git, npm
2.  Clone or fork this git repo.
3.  Open a terminal from the folder created in step 2.
4.  Run npm install
5.  Run npm run serve
6.  Open http://localhost:3030/demo/dev

## Running Tests

```
$ npm tests
```