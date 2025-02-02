import { deriveAddresses as deriveNewAddresses, Network } from '@trezor/utxo-lib';
import { getAddressType } from '@trezor/utxo-lib/lib/address';

import type { VinVout, PrederivedAddress } from '../types/backend';

export const isTxConfirmed = ({ blockHeight = -1 }: { blockHeight?: number }) => blockHeight > 0;

type VinVoutAddressTx = { vin: Pick<VinVout, 'addresses'>[]; vout: Pick<VinVout, 'addresses'>[] };

const doesAnyAddressFulfill = (
    { vin, vout }: VinVoutAddressTx,
    condition: (address: string) => boolean,
) =>
    vin
        .concat(vout)
        .flatMap(({ addresses = [] }) => addresses)
        .some(condition);

export const isTaprootTx = (tx: VinVoutAddressTx, network: Network) =>
    doesAnyAddressFulfill(tx, address => getAddressType(address, network) === 'p2tr');

export const doesTxContainAddress = (address: string) => (tx: VinVoutAddressTx) =>
    doesAnyAddressFulfill(tx, addr => addr === address);

export const deriveAddresses = (
    prederived: PrederivedAddress[] = [],
    ...[descriptor, type, from, count, network]: Parameters<typeof deriveNewAddresses>
) => {
    const fromPrederived = Math.min(from, prederived.length);
    const countPrederived = Math.min(prederived.length - fromPrederived, count);
    const fromNew = Math.max(from, prederived.length);
    const countNew = Math.max(count - countPrederived, 0);

    const derived = countNew
        ? deriveNewAddresses(descriptor, type, fromNew, countNew, network)
        : [];
    return prederived.slice(fromPrederived, fromPrederived + countPrederived).concat(derived);
};
