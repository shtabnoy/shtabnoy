import { createContext, MouseEvent, useContext, useState } from 'react';

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs.* components must be used inside <Tabs>');
  return ctx;
}

// TabsRoot
interface TabsProps {
  children: React.ReactNode;
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

function TabsRoot({
  children,
  defaultValue,
  value: controlledValue,
  onValueChange,
}: TabsProps) {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = (next: string) => {
    if (!isControlled) {
      setUncontrolledValue(next);
    }
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      {children}
    </TabsContext.Provider>
  );
}

// TabsList
interface TabsListProps {
  children: React.ReactNode;
}

function TabsList({ children }: TabsListProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const tabs = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    const currentIndex = tabs.indexOf(
      document.activeElement as HTMLButtonElement,
    );
    if (currentIndex === -1) return;

    let nextIndex: number | null = null;
    if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    if (e.key === 'ArrowLeft')
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') nextIndex = 0;
    if (e.key === 'End') nextIndex = tabs.length - 1;

    if (nextIndex !== null) {
      e.preventDefault(); // prevent page scroll
      tabs[nextIndex].focus();
      tabs[nextIndex].click(); // trigger the existing onClick → setValue
    }
  }

  return (
    <div role="tablist" onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}

// TabsTrigger
interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

function TabsTrigger({ children, value }: TabsTriggerProps) {
  const { value: selectedTab, setValue } = useTabsContext();

  return (
    <button
      role="tab"
      aria-selected={selectedTab === value}
      tabIndex={selectedTab === value ? 0 : -1}
      style={{
        padding: '4px',
        backgroundColor: selectedTab === value ? 'blue' : 'transparent',
      }}
      value={value}
      onClick={() => setValue(value)}
    >
      {children}
    </button>
  );
}

// TabsPanel
interface TabsPanelProps {
  value: string;
  children: React.ReactNode;
}

function TabsPanel({ children, value }: TabsPanelProps) {
  const { value: selectedTab } = useTabsContext();

  if (value !== selectedTab) return null;

  return <div role="tabpanel">{children}</div>;
}

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Panel: TabsPanel,
});
