import { ButtonGroup, Menu, Option } from '@rocket.chat/fuselage';
import React, { useCallback, useMemo } from 'react';

import { useUserInfoActionsSpread } from '../../room/hooks/useUserInfoActions';
import ConfirmOwnerChangeWarningModal from '../../../components/ConfirmOwnerChangeWarningModal';
import { UserInfo } from '../../room/contextualBar/UserInfo';
import { usePermission } from '../../../contexts/AuthorizationContext';
import { useSetModal } from '../../../contexts/ModalContext';
import { useRoute } from '../../../contexts/RouterContext';
import { useMethod, useEndpoint } from '../../../contexts/ServerContext';
import { useSetting } from '../../../contexts/SettingsContext';
import { useToastMessageDispatch } from '../../../contexts/ToastMessagesContext';
import { useTranslation } from '../../../contexts/TranslationContext';
import DeleteSuccessModal from '../../../components/DeleteSuccessModal';
import DeleteWarningModal from '../../../components/DeleteWarningModal';

export const UserInfoActions = ({ username, _id, isActive, isAdmin, onChange }) => {
	const t = useTranslation();
	const setModal = useSetModal();

	const directRoute = useRoute('direct');
	const userRoute = useRoute('admin-users');
	const dispatchToastMessage = useToastMessageDispatch();

	const canDirectMessage = usePermission('create-d');
	const canEditOtherUserInfo = usePermission('edit-other-user-info');
	const canAssignAdminRole = usePermission('assign-admin-role');
	const canResetE2EEKey = usePermission('edit-other-user-e2ee');
	const canResetTOTP = usePermission('edit-other-user-totp');
	const canEditOtherUserActiveStatus = usePermission('edit-other-user-active-status');
	const canDeleteUser = usePermission('delete-user');
	const canUpdateUser = usePermission('delete-user');

	const enforcePassword = useSetting('Accounts_TwoFactorAuthentication_Enforce_Password_Fallback');

	const confirmOwnerChanges = (action, modalProps = {}) => async () => {
		try {
			return await action();
		} catch (error) {
			if (error.xhr?.responseJSON?.errorType === 'user-last-owner') {
				const { shouldChangeOwner, shouldBeRemoved } = error.xhr.responseJSON.details;
				setModal(<ConfirmOwnerChangeWarningModal
					shouldChangeOwner={shouldChangeOwner}
					shouldBeRemoved={shouldBeRemoved}
					{...modalProps}
					onConfirm={async () => {
						await action(true);
						setModal();
					}}
					onCancel={() => { setModal(); onChange(); }}
				/>);
				return;
			}
			dispatchToastMessage({ type: 'error', message: error });
		}
	};

	const deleteUserQuery = useMemo(() => ({ userId: _id }), [_id]);
	const deleteUserEndpoint = useEndpoint('POST', 'users.delete');

	const erasureType = useSetting('Message_ErasureType');

	const deleteUser = confirmOwnerChanges(async (confirm = false) => {
		if (confirm) {
			deleteUserQuery.confirmRelinquish = confirm;
		}

		const result = await deleteUserEndpoint(deleteUserQuery);
		if (result.success) {
			setModal(<DeleteSuccessModal
				children={t('User_has_been_deleted')}
				onClose={() => { setModal(); onChange(); }}
			/>);
		} else {
			setModal();
		}
	}, {
		contentTitle: t(`Delete_User_Warning_${ erasureType }`),
		confirmLabel: t('Delete'),
	});

	const confirmDeleteUser = useCallback(() => {
		setModal(<DeleteWarningModal
			children={t(`Delete_User_Warning_${ erasureType }`)}
			onCancel={() => setModal()}
			onDelete={deleteUser}
		/>);
	}, [deleteUser, erasureType, setModal, t]);

	const setAdminStatus = useMethod('setAdminStatus');
	const changeAdminStatus = useCallback(async () => {
		try {
			await setAdminStatus(_id, !isAdmin);
			const message = isAdmin ? 'User_is_no_longer_an_admin' : 'User_is_now_an_admin';
			dispatchToastMessage({ type: 'success', message: t(message) });
			onChange();
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	}, [_id, dispatchToastMessage, isAdmin, onChange, setAdminStatus, t]);

	const resetE2EEKeyRequest = useEndpoint('POST', 'users.resetE2EKey');
	const resetTOTPRequest = useEndpoint('POST', 'users.resetTOTP');
	const resetE2EEKey = useCallback(async () => {
		setModal();
		const result = await resetE2EEKeyRequest({ userId: _id });

		if (result) {
			setModal(<DeleteSuccessModal
				children={t('Users_key_has_been_reset')}
				onClose={() => { setModal(); onChange(); }}
			/>);
		}
	}, [resetE2EEKeyRequest, onChange, setModal, t, _id]);

	const resetTOTP = useCallback(async () => {
		setModal();
		const result = await resetTOTPRequest({ userId: _id });

		if (result) {
			setModal(<DeleteSuccessModal
				children={t('Users_TOTP_has_been_reset')}
				onClose={() => { setModal(); onChange(); }}
			/>);
		}
	}, [resetTOTPRequest, onChange, setModal, t, _id]);

	const confirmResetE2EEKey = useCallback(() => {
		setModal(<DeleteWarningModal
			children={t('E2E_Reset_Other_Key_Warning')}
			deleteText={t('Reset')}
			onCancel={() => setModal()}
			onDelete={resetE2EEKey}
		/>);
	}, [resetE2EEKey, t, setModal]);

	const confirmResetTOTP = useCallback(() => {
		setModal(<DeleteWarningModal
			children={t('TOTP_Reset_Other_Key_Warning')}
			deleteText={t('Reset')}
			onCancel={() => setModal()}
			onDelete={resetTOTP}
		/>);
	}, [resetTOTP, t, setModal]);

	const activeStatusQuery = useMemo(() => ({
		userId: _id,
		activeStatus: !isActive,
	}), [_id, isActive]);
	const changeActiveStatusMessage = isActive ? 'User_has_been_deactivated' : 'User_has_been_activated';
	const changeActiveStatusRequest = useEndpoint('POST', 'users.setActiveStatus');

	const changeActiveStatus = confirmOwnerChanges(async (confirm = false) => {
		if (confirm) {
			activeStatusQuery.confirmRelinquish = confirm;
		}

		try {
			const result = await changeActiveStatusRequest(activeStatusQuery);
			if (result.success) {
				dispatchToastMessage({ type: 'success', message: t(changeActiveStatusMessage) });
				onChange();
			}
		} catch (error) {
			throw error;
		}
	}, {
		confirmLabel: t('Yes_deactivate_it'),
	});

	const directMessageClick = useCallback(() => directRoute.push({
		rid: username,
	}), [directRoute, username]);

	const editUserClick = useCallback(() => userRoute.push({
		context: 'edit',
		id: _id,
	}), [_id, userRoute]);


	// Savrasov, действие Обновить польователя из LDAP
	const updateUserLDAP = useMethod('ldap_sync_user');
	const updateUserLDAPClick = useCallback(async () => {
		try {
			await updateUserLDAP(_id);
			const message = 'Обновить польователя из LDAP';
			dispatchToastMessage({ type: 'success', message: t(message) });
			onChange();
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	}, [_id, dispatchToastMessage, onChange, updateUserLDAP, t]);
	///////////////////////////


	const options = useMemo(() => ({
		...canDirectMessage && { directMessage: {
			icon: 'chat',
			label: t('Direct_Message'),
			action: directMessageClick,
		} },
		...canEditOtherUserInfo && { editUser: {
			icon: 'edit',
			label: t('Edit'),
			action: editUserClick,
		} },
		...canAssignAdminRole && username && { makeAdmin: {
			icon: 'key',
			label: isAdmin ? t('Remove_Admin') : t('Make_Admin'),
			action: changeAdminStatus,
		} },
		...canUpdateUser && { updateUser: { //Savrasov, обновить из АД
			icon: 'globe',
			label: t('Обновить из LDAP'),
			action: updateUserLDAPClick,
		} },
		// ...canEditOtherUserInfo && { showRoomUser: { //Savrasov, обновить из АД
		// 	icon: 'hashtag',
		// 	label: t('Переписка пользователя'),
		// 	action: updateUserLDAPClick,
		// } },
		...canEditOtherUserActiveStatus && { changeActiveStatus: {
			icon: 'user',
			label: isActive ? t('Deactivate') : t('Activate'),
			action: changeActiveStatus,
		} },
		...canDeleteUser && { delete: {
			icon: 'trash',
			label: t('Delete'),
			action: confirmDeleteUser,
		} },
		...canResetE2EEKey && enforcePassword && { resetE2EEKey: {
			icon: 'key',
			label: t('Reset_E2E_Key'),
			action: confirmResetE2EEKey,
		} },
		...canResetTOTP && enforcePassword && { resetTOTP: {
			icon: 'key',
			label: t('Reset_TOTP'),
			action: confirmResetTOTP,
		} },
	}), [
		t,
		canDirectMessage,
		directMessageClick,
		canEditOtherUserInfo,
		editUserClick,
		canAssignAdminRole,
		isAdmin,
		changeAdminStatus,
		canDeleteUser,
		confirmDeleteUser,
		canEditOtherUserActiveStatus,
		isActive,
		changeActiveStatus,
		enforcePassword,
		canResetE2EEKey,
		canResetTOTP,
		confirmResetE2EEKey,
		confirmResetTOTP,
		username,
		canUpdateUser,
		updateUserLDAPClick,
	]);

	const { actions: actionsDefinition, menu: menuOptions } = useUserInfoActionsSpread(options);

	const menu = useMemo(() => {
		if (!menuOptions) {
			return null;
		}

		return <Menu
			mi='x4'
			placement='bottom-start'
			small={false}
			ghost={false}
			flexShrink={0}
			key='menu'
			renderItem={({ label: { label, icon }, ...props }) => <Option label={label} title={label} icon={icon} {...props}/>}
			options={menuOptions}
		/>;
	}, [menuOptions]);

	const actions = useMemo(() => {
		const mapAction = ([key, { label, icon, action }]) =>
			<UserInfo.Action key={key} title={label} label={label} onClick={action} icon={icon}/>;
		return [...actionsDefinition.map(mapAction), menu].filter(Boolean);
	}, [actionsDefinition, menu]);

	return <ButtonGroup flexGrow={0} justifyContent='center'>
		{actions}
	</ButtonGroup>;
};
