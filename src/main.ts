import { generate_event, include_base64, create_sc } from "massa-sc-std";
import { JSON } from 'json-as';

@json
export class ContractContext {
    token0 : string = "";
    token1 : string= "";
    pool : string = "";
}
function createContracts(): ContractContext {
    // Retrieve byteCode of Massa20 SC
    const bytesMassa20 = include_base64('./build/massa20.wasm');
    const token0 = create_sc(bytesMassa20);
    const token1 = create_sc(bytesMassa20);

    // Retrieve byteCode of LP SC
    const bytesPool= include_base64('./build/pool.wasm');
    const pool = create_sc(bytesPool);

    return {token0 ,token1, pool};
}

export function main(_args: string): i32 {
    const contractsContext = createContracts();
    generate_event(`Token0 : ${contractsContext.token0}  Token1 : ${contractsContext.token1}  Pool : ${contractsContext.pool}`);
    return 0;
}