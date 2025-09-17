import React, { useState } from 'react';
import { LabTestCatalog } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { X, Plus, Trash2, Edit, Save, Settings, ToggleLeft, ToggleRight, List } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

function TagInput({ tags, setTags }) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            if (!tags.includes(inputValue.trim())) {
                setTags([...tags, inputValue.trim()]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 rounded-full hover:bg-gray-300">
                            <X className="w-3 h-3" />
                        </button>
                    </Badge>
                ))}
            </div>
            <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a test name and press Enter"
            />
        </div>
    );
}

function CatalogItem({ item, onSave, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [categoryName, setCategoryName] = useState(item.category_name);
    const [tests, setTests] = useState(item.tests || []);
    const [hasPage, setHasPage] = useState(item.has_dedicated_page || false);

    const handleSave = async () => {
        await onSave(item.id, {
            category_name: categoryName,
            tests,
            has_dedicated_page: hasPage
        });
        setIsEditing(false);
    };
    
    if (isEditing) {
        return (
             <Card className="bg-gray-50">
                <CardHeader>
                    <Input value={categoryName} onChange={e => setCategoryName(e.target.value)} className="text-lg font-bold"/>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Tests in this Category</Label>
                        <TagInput tags={tests} setTags={setTests} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <Label htmlFor={`has-page-${item.id}`} className="flex flex-col">
                            <span>Create Sidebar Link</span>
                            <span className="text-xs text-gray-500">Adds a dedicated page for this lab category.</span>
                        </Label>
                        <Switch id={`has-page-${item.id}`} checked={hasPage} onCheckedChange={setHasPage} />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button onClick={handleSave}><Save className="w-4 h-4 mr-2"/>Save Changes</Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-row justify-between items-start">
                <div>
                    <CardTitle>{item.category_name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                        {item.has_dedicated_page ? <ToggleRight className="w-4 h-4 text-green-600"/> : <ToggleLeft className="w-4 h-4 text-gray-400"/>}
                        {item.has_dedicated_page ? "Sidebar link is active" : "No dedicated sidebar link"}
                    </CardDescription>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}><Edit className="w-4 h-4"/></Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></Button>
                </div>
            </CardHeader>
            <CardContent>
                 <Label>Available Tests</Label>
                 <div className="flex flex-wrap gap-2 mt-2">
                    {item.tests?.length > 0 ? item.tests.map(test => <Badge key={test} variant="outline">{test}</Badge>) : <p className="text-xs text-gray-500">No tests defined.</p>}
                 </div>
            </CardContent>
        </Card>
    )
}

export default function LabCatalogManager({ catalog, onClose }) {
    const [localCatalog, setLocalCatalog] = useState(catalog);
    const [isAdding, setIsAdding] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const newItem = await LabTestCatalog.create({ category_name: newCategoryName, tests: [] });
            setLocalCatalog(prev => [...prev, newItem]);
            setNewCategoryName("");
            setIsAdding(false);
        } catch (error) {
            console.error("Error creating category:", error);
        }
    };

    const handleSaveItem = async (id, data) => {
        try {
            await LabTestCatalog.update(id, data);
            setLocalCatalog(prev => prev.map(item => item.id === id ? { ...item, ...data } : item));
        } catch (error) {
            console.error("Error updating category:", error);
        }
    };
    
    const handleDeleteItem = async (id) => {
        if (!window.confirm("Are you sure you want to delete this category? This cannot be undone.")) return;
        try {
            await LabTestCatalog.delete(id);
            setLocalCatalog(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error("Error deleting category:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between border-b">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-purple-600" />
                        <CardTitle>Manage Lab Test Catalog</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="space-y-4">
                        {localCatalog.map(item => (
                            <CatalogItem key={item.id} item={item} onSave={handleSaveItem} onDelete={handleDeleteItem} />
                        ))}
                    </div>

                    {isAdding ? (
                        <div className="p-4 border rounded-lg space-y-2">
                            <Label htmlFor="new-cat">New Category Name</Label>
                            <Input id="new-cat" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="e.g., Hematology"/>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                                <Button onClick={handleCreateCategory}>Add Category</Button>
                            </div>
                        </div>
                    ) : (
                        <Button variant="outline" className="w-full" onClick={() => setIsAdding(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Add New Category
                        </Button>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={onClose} className="w-full">Done</Button>
                </CardFooter>
            </Card>
        </div>
    );
}