import { Storage, Context, call, print } from "massa-sc-std";
import { JSON } from "json-as";
import { AllowArgs, InitializeParams, MintParams } from './massa20';
import { PoolParams, SwapParams } from './pool';

export function main(_args: string): i32 {
    // /* =====================================================
    //                          CONST
    // ===================================================== */
    const token0 = "A1D3ejDyPksNngn3KC1VjjPmKqsqD7vpVZFhYwZ7JiStYR1ehwk";
    const token1 = "A1QwT468eqghuADLzAWDBZMYHnCfRZNE7JRoLdY3mifbmqoS8hn";
    const pool   = "A12r1WziD4xj6gVYxgwiZqET7oXdixtLX5n4tdd2DGUW8qUgpeTB";

    const addresses = Context.get_call_stack();
    const owner     = addresses[0];
    print(`Owner is ${owner}`);

    // /* =====================================================
    //                          INIT
    // ===================================================== */
    call(token0, "initialize", JSON.stringify<InitializeParams>({name: "USD Coin", symbol : "USDC", initialSupply : 0, decimals : 18 }), 0);
    print("Token0 Initialized");

    call(token1, "initialize", JSON.stringify<InitializeParams>({name: "Tether", symbol : "USDT", initialSupply : 0, decimals : 18 }), 0);
    print("Token1 Initialized");

    call(pool, "initialize", JSON.stringify<PoolParams>({token0, token1}), 0);
    print("Pool Initialized");
    

    // /* =====================================================
    //                          MINT
    // ===================================================== */
    call(token0, "mint", JSON.stringify<MintParams>({address : owner, amount : 20_000}), 0);
    print("5k Token0 Minted on owner");

    call(token0, "mint", JSON.stringify<MintParams>({address : pool, amount : 10_000}), 0);
    print("10k Token0 Minted on pool");

    call(token1, "mint", JSON.stringify<MintParams>({address : pool, amount : 10_000}), 0);
    print("10k Token1 minted on pool");

    // /* =====================================================
    //                        ALLOW 
    // ===================================================== */
    call(token0, "allow", JSON.stringify<AllowArgs>({amount : 200_000_000, spender : pool}), 0);
    call(token1, "allow", JSON.stringify<AllowArgs>({amount : 200_000_000, spender : pool}), 0);
    print("Allow Succeed");

    // /* =====================================================
    //                        SWAP 
    // ===================================================== */
    call(pool, "swap", JSON.stringify<SwapParams>({ amountIn : 100, tokenIn : token0, amountOut : 100, tokenOut : token1, recipient : pool}), 0);
    print("Swap Succeeds");

    // /* =====================================================
    //                        LOG 
    // ===================================================== */
    // Retrieve data from contract
    const token0TotalSupply = Storage.get_data_for(token0, "totalSupply");
    print(`Token0 supply is ${token0TotalSupply}`);

    const token1TotalSupply = Storage.get_data_for(token1, "totalSupply");
    print(`Token1 supply is ${token1TotalSupply}`);

    const ownerBalanceToken0 = call(token0, "balanceOf", owner, 0);
    print(`Token0 Owner balance is ${ownerBalanceToken0}`);

    const ownerBalanceToken1 = call(token1, "balanceOf", owner, 0);
    print(`Token1 Owner balance is ${ownerBalanceToken1}`);

    const poolBalanceToken0 = call(token0, "balanceOf", pool, 0);
    print(`Token0 Pool balance is ${poolBalanceToken0}`);

    const poolBalanceToken1 = call(token1, "balanceOf", pool, 0);
    print(`Token1 Pool balance is ${poolBalanceToken1}`);
    return 0;
}