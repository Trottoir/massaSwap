
import { JSON } from 'json-as';
import { Storage, generate_event, print, Context, call } from "massa-sc-std";
import { TransferFromArgs, TransferParams } from './massa20';

// /* =====================================================
//                EXTERNAL FUNCTIONS
// ===================================================== */

const IS_INIT = "isInit";
const OWNER = "owner";

const TOKEN0 = "token0";
const TOKEN1 = "token1";


export function _ownerGuard() : void {
    assert(owner() == Context.get_tx_creator(), "Caller not the owner");
}

@json
export class PoolParams {
    token0 : string = "";
    token1 : string= "";
}
// Constructor equivalent
export function initialize(_args: string): void {
    // Ensure that the initialize is called only once
    assert(Storage.get_data_or_default(IS_INIT, "false") == "false", "Already initialized");

    const poolParams = JSON.parse<PoolParams>(_args);
    Storage.set_data(TOKEN0, poolParams.token0);
    Storage.set_data(TOKEN1, poolParams.token1);
    Storage.set_data(OWNER, Context.get_tx_creator());
    Storage.set_data(IS_INIT, "true");
    generate_event(`Pool with tokens ${poolParams.token0} &  ${poolParams.token1} created`);

    print(`Pool with tokens ${poolParams.token0} &  ${poolParams.token1} created`);
}

@json
export class SwapParams {
    tokenIn : string = "";
    amountIn : u64 = 0;
    tokenOut : string = "";
    amountOut : u64 = 0;
    recipient : string ="";
}
// Swap method
export function swap(_args: string): void {
    const swapParams = JSON.parse<SwapParams>(_args);
    const addresses = Context.get_call_stack();

    const owner = addresses[0]; 
    const pool = addresses[1];

    call(swapParams.tokenOut, "transfer", JSON.stringify<TransferParams>({to: owner, amount: swapParams.amountOut}), 0);
    call(swapParams.tokenIn, "transferFrom", JSON.stringify<TransferFromArgs>({owner, to: pool, amount: swapParams.amountIn}), 0);

    print(`${owner} swaps ${swapParams.amountIn} token0 to ${swapParams.amountOut} token1`); 
}

export function token0():string {
    return Storage.get_data(TOKEN0);
}

export function token1():string {
    return Storage.get_data(TOKEN1);
}

export function owner():string {
    return Storage.get_data(OWNER);
}

export function token0Balance() : string {
    const callStack = Context.get_call_stack();
    return call(token0(), "balanceOf",callStack[callStack.length - 1] , 0);
}

export function token1Balance() : string {
    const callStack = Context.get_call_stack();
    return call(token1(), "balanceOf", callStack[callStack.length - 1] , 0);
}