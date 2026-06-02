'use client';

import { Tabs } from '@/components/Tabs';

export default function CompoundPatternTab() {
  return (
    <Tabs defaultValue="overview">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="prices">Prices</Tabs.Trigger>
        <Tabs.Trigger value="news">News</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Panel value="overview">
        <h2>Overview content</h2>
      </Tabs.Panel>
      <Tabs.Panel value="prices">
        <h2>Prices content</h2>
      </Tabs.Panel>
      <Tabs.Panel value="news">
        <h2>News content</h2>
      </Tabs.Panel>
    </Tabs>
  );
}
