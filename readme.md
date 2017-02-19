# OoI

A little addon to visualize object graphs in Firefox.

# Make it work

To have this working:

1. Get [cfx](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/tutorials/getting-started-with-cfx.html)
1. run `cfx xpi` at the root of the `Firefox` directory
1. `grunt typescript`
1. run `cfx run ooi.xpi` to play with the addon (use the `-b <path>` option to provide a specific Firefox binary if appropriate)


In development, go to directory root and do (assuming you already have Grunt installed):

1. `grunt watch`

# Licence

[MIT](./licence)

# Random stuffs

`cfx test -b /home/david/Logiciel/aurora/firefox`
`cfx xpi ; cfx -b /home/david/Logiciel/aurora/firefox --static-args="{\"browser-toolbox\": true, \"faster-chrome\": true}" run ooi.xpi`
