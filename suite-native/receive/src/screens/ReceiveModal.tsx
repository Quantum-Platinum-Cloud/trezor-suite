import React from 'react';

import { CommonActions, RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import {
    RootStackParamList,
    RootStackRoutes,
    Screen,
    ScreenHeader,
    StackNavigationProps,
} from '@suite-native/navigation';
import { AccountsList } from '@suite-native/accounts';
import { AccountKey, TokenSymbol } from '@suite-common/wallet-types';

import { ReceiveAccount } from '../components/ReceiveAccount';

export const ReceiveModal = () => {
    const route = useRoute<RouteProp<RootStackParamList, RootStackRoutes.ReceiveModal>>();

    const navigation =
        useNavigation<StackNavigationProps<RootStackParamList, RootStackRoutes.ReceiveModal>>();

    const handleSelectAccount = (accountKey: AccountKey, tokenSymbol?: TokenSymbol) => {
        navigation.dispatch({
            ...CommonActions.setParams({ accountKey, tokenSymbol }),
        });
    };

    return (
        <Screen header={<ScreenHeader />}>
            {route.params?.accountKey ? (
                <ReceiveAccount
                    accountKey={route.params.accountKey}
                    tokenSymbol={route.params?.tokenSymbol}
                />
            ) : (
                <AccountsList onSelectAccount={handleSelectAccount} />
            )}
        </Screen>
    );
};
