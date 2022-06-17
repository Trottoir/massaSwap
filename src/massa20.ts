
import { JSON } from 'json-as';
import { Storage, generate_event, print, Context } from "massa-sc-std";

// /* =====================================================
//                EXTERNAL FUNCTIONS
// ===================================================== */

const IS_INIT = "isInit";
const NAME = "name";
const SYMBOL = "symbol";
const TOTAL_SUPPLY = "totalSupply";
const OWNER = "owner";

export function _ownerGuard() : void {
    assert(owner() == Context.get_tx_creator(), "Caller not the owner");
}


// /* =====================================================
//                INITIALIZE FUNCTIONS
// ===================================================== */
@json
export class InitializeParams {
    name : string = "";
    symbol : string= "";
    initialSupply : u64 = 0;
    decimals : u32 = 0;
}
export function initialize(_args: string): void {
    // Ensure that nobod
    assert(Storage.get_data_or_default(IS_INIT, "false") == "false", "Already initialized");

    const initParams = JSON.parse<InitializeParams>(_args);
    Storage.set_data(NAME, initParams.name);
    Storage.set_data(SYMBOL, initParams.symbol);
    Storage.set_data(TOTAL_SUPPLY, initParams.initialSupply.toString());
    Storage.set_data(OWNER, Context.get_tx_creator());
    Storage.set_data(IS_INIT, "true");

    generate_event(`${initParams.name} initialized with symbol ${initParams.symbol}`);

    print(`${initParams.name} initialized with symbol ${initParams.symbol}`);
}

// /* =====================================================
//                EXTERNAL FUNCTIONS
// ===================================================== */

@json
export class AllowArgs {
    spender: string = "";
    amount: u64 = 0;
}
export function allow(_args: string): string {
    const args = JSON.parse<AllowArgs>(_args);
    const caller = Context.get_caller();
    print(caller + " allow");
    _setAllowance(caller, args.spender, args.amount);
    return args.amount.toString();
}

@json
export class TransferFromArgs {
    owner: string = "";
    to: string = "";
    amount: u64 = 0;
}
export function transferFrom(_args: string): void {
    const addresses = Context.get_call_stack();
    const spender = addresses[addresses.length - 2];
    const args = JSON.parse<TransferFromArgs>(_args);
    const allowed = U64.parseInt(_getAllowance(args.owner, spender));
    assert(args.amount < allowed, "ALLOWANCE_EXCEEDED");
    _transfer(args.owner, args.to, args.amount);
    const newAllowance = allowed - args.amount;
    _setAllowance(args.owner, spender, newAllowance);
}

@json
export class TransferParams {
    to : string = "";
    amount : u64 = 0;
}
export function transfer(_args: string): string {
    const transferParams = JSON.parse<TransferParams>(_args);
    const caller = Context.get_caller();
    return _transfer(caller, transferParams.to, transferParams.amount).toString();
}

@json
export class MintParams {
    address : string = "";
    amount : u64= 0;
}
export function mint(_args: string): void {
    // assert that the caller is the contract's owner
    _ownerGuard();

    const mintParams = JSON.parse<MintParams>(_args);

    // Retrieve, update and set the new total supply according to minted amount
    let totalSupply = u64(parseInt(Storage.get_data(TOTAL_SUPPLY)));
    totalSupply += mintParams.amount;
    Storage.set_data(TOTAL_SUPPLY, totalSupply.toString());

    // add token to the balance address
    const userBalKey = _balKeyBuilder(mintParams.address);
    let balance = u64(parseInt(Storage.get_data_or_default(userBalKey, "0")));
    balance += mintParams.amount;
    Storage.set_data(userBalKey, balance.toString());    

    print(`${mintParams.amount} token have been minted to ${mintParams.address}`); 
}

@json
export class BurnParams {
    address : string = "";
    amount : u64= 0;
}
export function burn(_args: string): void {
    // assert that the caller is the contract's owner
    _ownerGuard();

    const burnParams = JSON.parse<BurnParams>(_args);

    // remove token to the balance address
    const userBalKey = _balKeyBuilder(burnParams.address);
    let balance = u64(parseInt(Storage.get_data_or_default(userBalKey, "0")));
    assert(balance >= burnParams.amount, "INSUFFICIENT_BALANCE");
    balance -= burnParams.amount;
    Storage.set_data(userBalKey, balance.toString()); 

    // Retrieve, update and set the new total supply according to minted amount
    let totalSupply = u64(parseInt(Storage.get_data(TOTAL_SUPPLY)));
    totalSupply -= burnParams.amount;
    Storage.set_data(TOTAL_SUPPLY, totalSupply.toString());

    print(`${burnParams.amount} token have been burnt to ${burnParams.address}`); 
}

// /* =====================================================
//                VIEW FUNCTIONS
// ===================================================== */

export function totalSupply(): string {
    return Storage.get_data_or_default(TOTAL_SUPPLY, "0");
}

export function owner(): string {
    return Storage.get_data_or_default(OWNER, "");
}

export function balanceOf(address:string) : string {
    return Storage.get_data_or_default(_balKeyBuilder(address), "0");
}

@json
export class AllowanceArgs {
    owner: string = "";
    spender: string = "";
}
export function allowance(_args: string): string {
    const args = JSON.parse<AllowanceArgs>(_args);
    return _getAllowance(args.owner, args.spender);
}

// /* =====================================================
//                INTERNAL FUNCTIONS
// ===================================================== */

function _setAllowance(owner: string, spender : string, amount : u64 ) : void {
    Storage.set_data(_allowKeyBuilder(owner,spender), amount.toString());
}

function _getAllowance(owner: string, spender : string) : string {
    return Storage.get_data_or_default(_allowKeyBuilder(owner,spender), "0");
}

function _balKeyBuilder(address:string) : string{
    return `bal${address}`;
}

function _allowKeyBuilder(address:string, spender:string) : string{
    return `allow${address}${spender}`;
}

function _transfer(sender: string, recipient: string, amount: u64): u64 {
    let senderBal = U64.parseInt(balanceOf(sender));
    assert(senderBal > amount, "INSUFFICIENT_BALANCE")
    let receiverBal = U64.parseInt(balanceOf(recipient));
    senderBal -= amount;
    _setBalance(sender, senderBal);
    receiverBal += amount;
    _setBalance(recipient, receiverBal);
    return amount;
}

function _setBalance(address: string, balance: u64): void {
    Storage.set_data(_balKeyBuilder(address), balance.toString());
}
