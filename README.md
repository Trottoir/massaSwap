# Prerequisites 🌍

- massa-node running
- massa-client running

## Quick setup 🧰

First we need to build :
    - massa20 => ERC20 like
    - pool    => Acting as a fake reserve of currency
    - main

```shell
yarn build1
```

Let's deploy that to the network, run that on the massa-client : 

```shell
send_smart_contract <yourAddress> <...>\build\main.wasm 100000000 0 0 0
```

Once is done, we need to listen events to retrieve the addresses of the 3 contracts deployed.

```shell
get_filtered_sc_output_event caller_address=<yourAddress>
```

Let's now replace the 3 contracts addresses in massa20Test.ts

Now build that massa20Test 

```shell
yarn build2
```

Finally send the massa20Test on the network 

```shell
send_smart_contract <yourAddress> <...>\build\massa20Test.wasm 100000000 0 0 0
```


