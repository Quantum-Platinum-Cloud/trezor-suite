import { createMiddlewareWithExtraDeps } from '@suite-common/redux-utils';
import { BLOCKCHAIN as TREZOR_CONNECT_BLOCKCHAIN_ACTIONS } from '@trezor/connect';

import { transactionsActions } from '../transactions/transactionsActions';
import { accountsActions } from '../accounts/accountsActions';
import { selectAccounts } from '../accounts/accountsReducer';
import {
    removeFiatRatesForDisabledNetworksThunk,
    updateCurrentFiatRatesThunk,
    initFiatRatesThunk,
    updateLastWeekFiatRatesThunk,
    updateTxsFiatRatesThunk,
    onUpdateFiatRateThunk,
} from './fiatRatesThunks';
import { blockchainActions } from '../blockchain/blockchainActions';

export const prepareFiatRatesMiddleware = createMiddlewareWithExtraDeps(
    (action, { dispatch, extra, next, getState }) => {
        const {
            actions: { setWalletSettingsLocalCurrency, changeWalletSettingsNetworks },
        } = extra;
        const prevStateAccounts = selectAccounts(getState());

        if (accountsActions.updateAccount.match(action)) {
            // fetch rates for new tokens added on account update
            const account = action.payload;
            const prevAccount = prevStateAccounts.find(
                a => a.descriptor === account.descriptor && a.symbol === account.symbol,
            );

            if (account.tokens) {
                const difference = account.tokens.filter(
                    token =>
                        !prevAccount?.tokens?.find(
                            prevToken => prevToken.contract === token.contract,
                        ),
                );

                difference.forEach(token => {
                    if (token.symbol) {
                        dispatch(
                            updateCurrentFiatRatesThunk({
                                ticker: {
                                    symbol: token.symbol,
                                    mainNetworkSymbol: account.symbol,
                                    tokenAddress: token.contract,
                                },
                            }),
                        );
                    }
                });
            }
        }

        if (accountsActions.createAccount.match(action)) {
            // fetch current rates for account's tokens
            const account = action.payload;
            account.tokens?.forEach(token => {
                if (!token.symbol) {
                    return;
                }
                dispatch(
                    updateCurrentFiatRatesThunk({
                        ticker: {
                            symbol: token.symbol,
                            mainNetworkSymbol: account.symbol,
                            tokenAddress: token.contract,
                        },
                    }),
                );
            });
        }

        if (transactionsActions.addTransaction.match(action)) {
            // fetch historical rates for each added transaction
            const { account, transactions } = action.payload;
            dispatch(
                updateTxsFiatRatesThunk({
                    account,
                    txs: transactions,
                }),
            );
        }

        if (setWalletSettingsLocalCurrency.match(action)) {
            // for coins relying on coingecko we only fetch rates for one fiat currency
            dispatch(updateLastWeekFiatRatesThunk());
        }

        if (changeWalletSettingsNetworks.match(action)) {
            dispatch(removeFiatRatesForDisabledNetworksThunk());
        }

        if (blockchainActions.connected.match(action)) {
            dispatch(initFiatRatesThunk(action.payload));
        }

        if (action.type === TREZOR_CONNECT_BLOCKCHAIN_ACTIONS.FIAT_RATES_UPDATE) {
            dispatch(onUpdateFiatRateThunk(action.payload));
        }

        return next(action);
    },
);
