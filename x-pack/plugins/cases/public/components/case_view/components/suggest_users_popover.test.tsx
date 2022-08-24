/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { useSuggestUserProfiles } from '../../../containers/user_profiles/use_suggest_user_profiles';
import { AppMockRenderer, createAppMockRenderer } from '../../../common/mock';
import { screen, fireEvent } from '@testing-library/react';
import { SuggestUsersPopoverProps, SuggestUsersPopover } from './suggest_users_popover';
import { userProfiles } from '../../../containers/user_profiles/api.mock';
import { waitForEuiPopoverOpen } from '@elastic/eui/lib/test/rtl';
import { UserProfileWithAvatar } from '@kbn/user-profile-components';
import { AssigneeWithProfile } from '../../user_profiles/types';

jest.mock('../../../containers/user_profiles/use_suggest_user_profiles');

const useSuggestUserProfilesMock = useSuggestUserProfiles as jest.Mock;

describe('SuggestUsersPopover', () => {
  let appMockRender: AppMockRenderer;
  let defaultProps: SuggestUsersPopoverProps;

  beforeEach(() => {
    useSuggestUserProfilesMock.mockReturnValue({ data: userProfiles, isLoading: false });

    appMockRender = createAppMockRenderer();

    defaultProps = {
      isLoading: false,
      assignedUsersWithProfiles: [],
      isPopoverOpen: true,
      onUsersChange: jest.fn(),
      togglePopover: jest.fn(),
      onClosePopover: jest.fn(),
    };
  });

  it('calls onUsersChange when 1 user is selected', async () => {
    const onUsersChange = jest.fn();
    const props = { ...defaultProps, onUsersChange };
    appMockRender.render(<SuggestUsersPopover {...props} />);

    await waitForEuiPopoverOpen();

    fireEvent.change(screen.getByPlaceholderText('Search users'), { target: { value: 'dingo' } });
    fireEvent.click(screen.getByText('wet_dingo@elastic.co'));

    expect(onUsersChange.mock.calls[0][0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "data": Object {},
          "enabled": true,
          "uid": "u_9xDEQqUqoYCnFnPPLq5mIRHKL8gBTo_NiKgOnd5gGk0_0",
          "user": Object {
            "email": "wet_dingo@elastic.co",
            "full_name": "Wet Dingo",
            "username": "wet_dingo",
          },
        },
      ]
    `);
  });

  it('calls onUsersChange when multiple users are selected', async () => {
    const onUsersChange = jest.fn();
    const props = { ...defaultProps, onUsersChange };
    appMockRender.render(<SuggestUsersPopover {...props} />);

    await waitForEuiPopoverOpen();

    fireEvent.change(screen.getByPlaceholderText('Search users'), { target: { value: 'elastic' } });
    fireEvent.click(screen.getByText('wet_dingo@elastic.co'));
    fireEvent.click(screen.getByText('damaged_raccoon@elastic.co'));

    expect(onUsersChange.mock.calls[1][0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "data": Object {},
          "enabled": true,
          "uid": "u_J41Oh6L9ki-Vo2tOogS8WRTENzhHurGtRc87NgEAlkc_0",
          "user": Object {
            "email": "damaged_raccoon@elastic.co",
            "full_name": "Damaged Raccoon",
            "username": "damaged_raccoon",
          },
        },
        Object {
          "data": Object {},
          "enabled": true,
          "uid": "u_9xDEQqUqoYCnFnPPLq5mIRHKL8gBTo_NiKgOnd5gGk0_0",
          "user": Object {
            "email": "wet_dingo@elastic.co",
            "full_name": "Wet Dingo",
            "username": "wet_dingo",
          },
        },
      ]
    `);
  });

  it('calls onUsersChange with the current user (Physical Dinosaur) at the beginning', async () => {
    const onUsersChange = jest.fn();
    const props = {
      ...defaultProps,
      assignedUsersWithProfiles: [asAssignee(userProfiles[1]), asAssignee(userProfiles[0])],
      currentUserProfile: userProfiles[1],
      onUsersChange,
    };
    appMockRender.render(<SuggestUsersPopover {...props} />);

    await waitForEuiPopoverOpen();

    fireEvent.change(screen.getByPlaceholderText('Search users'), { target: { value: 'elastic' } });
    fireEvent.click(screen.getByText('wet_dingo@elastic.co'));

    expect(onUsersChange.mock.calls[0][0]).toMatchInlineSnapshot(`
      Array [
        Object {
          "data": Object {},
          "enabled": true,
          "uid": "u_A_tM4n0wPkdiQ9smmd8o0Hr_h61XQfu8aRPh9GMoRoc_0",
          "user": Object {
            "email": "physical_dinosaur@elastic.co",
            "full_name": "Physical Dinosaur",
            "username": "physical_dinosaur",
          },
        },
        Object {
          "data": Object {},
          "enabled": true,
          "uid": "u_J41Oh6L9ki-Vo2tOogS8WRTENzhHurGtRc87NgEAlkc_0",
          "user": Object {
            "email": "damaged_raccoon@elastic.co",
            "full_name": "Damaged Raccoon",
            "username": "damaged_raccoon",
          },
        },
        Object {
          "data": Object {},
          "enabled": true,
          "uid": "u_9xDEQqUqoYCnFnPPLq5mIRHKL8gBTo_NiKgOnd5gGk0_0",
          "user": Object {
            "email": "wet_dingo@elastic.co",
            "full_name": "Wet Dingo",
            "username": "wet_dingo",
          },
        },
      ]
    `);
  });

  it('does not show the assigned users total if there are no assigned users', async () => {
    appMockRender.render(<SuggestUsersPopover {...defaultProps} />);

    await waitForEuiPopoverOpen();

    expect(screen.queryByTestId('case-view-assignees-popover-totals')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Search users'), { target: { value: 'dingo' } });
    fireEvent.click(screen.getByText('wet_dingo@elastic.co'));
  });

  it('shows the 1 assigned total', async () => {
    const props = {
      ...defaultProps,
      assignedUsersWithProfiles: [{ uid: userProfiles[0].uid, profile: userProfiles[0] }],
    };
    appMockRender.render(<SuggestUsersPopover {...props} />);

    await waitForEuiPopoverOpen();

    expect(screen.getByTestId('case-view-assignees-popover-totals')).toBeInTheDocument();
    expect(screen.getByText('1 assigned')).toBeInTheDocument();
    expect(screen.getByText('Damaged Raccoon')).toBeInTheDocument();
  });

  it('calls onTogglePopover when clicking the edit button after the popover is already open', async () => {
    const togglePopover = jest.fn();
    const props = {
      ...defaultProps,
      togglePopover,
    };
    appMockRender.render(<SuggestUsersPopover {...props} />);

    await waitForEuiPopoverOpen();

    fireEvent.click(screen.getByTestId('case-view-assignees-edit-button'));

    expect(togglePopover).toBeCalled();
  });

  it('shows the empty message initially', async () => {
    useSuggestUserProfilesMock.mockReturnValue({ data: [], isLoading: false });
    appMockRender.render(<SuggestUsersPopover {...defaultProps} />);

    await waitForEuiPopoverOpen();

    fireEvent.click(screen.getByTestId('case-view-assignees-edit-button'));

    expect(screen.queryByTestId('case-view-assignees-popover-no-matches')).not.toBeInTheDocument();
  });

  it('shows the no matches component', async () => {
    useSuggestUserProfilesMock.mockReturnValue({ data: [], isLoading: false });
    appMockRender.render(<SuggestUsersPopover {...defaultProps} />);

    await waitForEuiPopoverOpen();

    fireEvent.click(screen.getByTestId('case-view-assignees-edit-button'));
    fireEvent.change(screen.getByPlaceholderText('Search users'), { target: { value: 'bananas' } });

    expect(screen.getAllByTestId('case-view-assignees-popover-no-matches')[0]).toBeInTheDocument();
  });
});

const asAssignee = (profile: UserProfileWithAvatar): AssigneeWithProfile => ({
  uid: profile.uid,
  profile,
});
