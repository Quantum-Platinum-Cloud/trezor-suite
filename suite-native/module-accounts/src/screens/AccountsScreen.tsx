import React from 'react';

import { useNavigation } from '@react-navigation/native';

import {
    RootStackParamList,
    RootStackRoutes,
    Screen,
    StackNavigationProps,
} from '@suite-native/navigation';
import { AccountsList } from '@suite-native/accounts';
import { AccountKey } from '@suite-common/wallet-types';
import { EthereumTokenSymbol } from '@suite-native/ethereum-tokens';

import { AccountsScreenHeader } from '../components/AccountsScreenHeader';

export const AccountsScreen = () => {
    const navigation =
        useNavigation<StackNavigationProps<RootStackParamList, RootStackRoutes.AccountDetail>>();

    const handleSelectAccount = (accountKey: AccountKey, tokenSymbol?: EthereumTokenSymbol) => {
        navigation.navigate(RootStackRoutes.AccountDetail, {
            accountKey,
            tokenSymbol,
        });
    };

    return (
        <Screen header={<AccountsScreenHeader />}>
            <AccountsList onSelectAccount={handleSelectAccount} />
        </Screen>
    );
};
