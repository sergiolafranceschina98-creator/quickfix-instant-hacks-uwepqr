
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <Label>Home</Label>
        <Icon sf={{ default: 'house', selected: 'house.fill' }} drawable="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Label>Saved</Label>
        <Icon sf={{ default: 'bookmark', selected: 'bookmark.fill' }} drawable="bookmark" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
