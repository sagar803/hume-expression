import { TabId, tabs } from "@/lib/types";
import { Button } from "../ui/button";


interface TabsSectionProps {
    activeTab: TabId;
    onChangeTab: (tab: TabId) => void;
}

const TabsSection: React.FC<TabsSectionProps> = ({ activeTab, onChangeTab }) => (
    <>
        <div className="m-2 p-2 bg-gray-200 rounded-lg">
            <div className="flex flex-col md:flex-row space-x-2">
                {tabs.map(tab => (
                    <Button
                        key={tab.id}
                        variant="ghost"
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                            activeTab === tab.id
                                ? 'bg-white text-black shadow-sm'
                                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                        onClick={() => onChangeTab(tab.id)}
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>
        </div>
    </>
);

export default TabsSection;