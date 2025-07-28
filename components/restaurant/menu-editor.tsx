'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Loader2, Save, PlusCircle, Trash2, Pencil } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { updateMenu } from '@/app/(dashboard)/dashboard/restaurants/actions';
import { getColumns } from './menu-table-columns';
import { MenuDataTable } from './menu-data-table';
import type { RestaurantDetails, MenuItem, MenuCategory, MenuSchema } from '@/lib/types';
import {ActionState} from "@/lib/auth/middleware";


function MenuItemForm({
                          item,
                          categories,
                          onSave
                      }: {
    item: Partial<MenuItem>;
    categories: Record<string, MenuCategory>;
    onSave: (item: MenuItem) => void;
}) {
    const [name, setName] = useState(item.name["en-US"] || '');
    const [description, setDescription] = useState(item.description["en-US"] || '');
    const [price, setPrice] = useState(item.price || 0);
    const [category, setCategory] = useState(
        item.category && categories[item.category.toLowerCase()]
            ? categories[item.category.toLowerCase()].id
            : 'Uncategorized'
    );


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: item.id!,
            name: { "en-US": name },
            description: { "en-US": description },
            price: price,
            category: category,
            available: item.available ?? true
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
            <div className="grid gap-2">
                <Label>Price</Label>
                <Input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(categories).map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.name["en-US"]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button type="submit">Save Item</Button>
        </form>
    );
}

export function MenuEditor({ details }: { details: RestaurantDetails }) {
    const [menu, setMenu] = useState<MenuSchema>(
        (details.menus[0]?.menuData as MenuSchema) || { categories: {}, items: [] }
    );
    const [newCategoryName, setNewCategoryName] = useState('');
    const [state, formAction, isPending] = useActionState<ActionState, FormData>(
        updateMenu,
        {}
    );
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<MenuItem> | null>(
        null
    );

    // Ensure "Uncategorized" always exists if categories are defined
    if (menu.categories && !menu.categories.Uncategorized) {
        menu.categories.Uncategorized = { id: 'Uncategorized', name: { "en-US": 'Uncategorized' }, description: { "en-US": 'Default category' } };
    }

    const handleCreateCategory = () => {
        if (!newCategoryName.trim()) return;

        const newId = uuidv4();
        const newCategory: MenuCategory = {
            id: newId,
            name: { "en-US": newCategoryName },
            description: { "en-US": '' }
        };

        setMenu((prevMenu) => ({
            ...prevMenu,
            categories: {
                ...prevMenu.categories,
                [newId]: newCategory
            }
        }));
        setNewCategoryName('');
    };

    const handleDeleteCategory = (categoryId: string) => {
        if (categoryId === 'Uncategorized') return;
        if (!window.confirm("Are you sure? Items in this category will be moved to 'Uncategorized'.")) return;

        const updatedCategories = { ...menu.categories };
        delete updatedCategories[categoryId];

        const updatedItems = menu.items.map(item =>
            item.category === categoryId ? { ...item, category: 'Uncategorized' } : item
        );

        setMenu({ categories: updatedCategories, items: updatedItems });
    };

    const handleEditItem = (item: MenuItem) => {
        setCurrentItem(item);
        setDialogOpen(true);
    };
    const handleAddItem = () => {
        setCurrentItem({
            id: uuidv4(),
            name: { "en-US": '' },
            description: { "en-US": '' },
            price: 0,
            category: 'Uncategorized',
            available: true
        });
        setDialogOpen(true);
    };
    const handleDeleteItem = (itemId: string) => {
        setMenu({ ...menu, items: menu.items.filter((i) => i.id !== itemId) });
    };
    const handleSaveItem = (item: MenuItem) => {
        const newItems = [...menu.items];
        const itemIndex = newItems.findIndex((i) => i.id === item.id);
        if (itemIndex > -1) {
            newItems[itemIndex] = item;
        } else {
            newItems.push(item);
        }
        setMenu({ ...menu, items: newItems });
        setDialogOpen(false);
    };

    const columns = getColumns({
        onEdit: handleEditItem,
        onDelete: handleDeleteItem
    });

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Menu Categories</CardTitle>
                    <CardDescription>
                        Manage your menu categories. Items from deleted categories will be
                        moved to 'Uncategorized'.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-4">
                        <Input
                            placeholder="New category name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                        />
                        <Button type="button" onClick={handleCreateCategory}>
                            Add
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {Object.values(menu.categories).map((cat) => (
                            <Badge key={cat.id} variant="secondary" className="pl-3 pr-1 py-1 text-sm">
                                {cat.name["en-US"]}
                                {cat.id !== 'Uncategorized' && (
                                    <button
                                        type="button"
                                        className="ml-2 rounded-full hover:bg-destructive/20 p-0.5"
                                        onClick={() => handleDeleteCategory(cat.id)}
                                    >
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                    </button>
                                )}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Menu Items</CardTitle>
                    <CardDescription>
                        Add or edit items in your restaurant's menu.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="justify-between items-center border-t pt-4">
                    <Button type="button" variant="outline" onClick={handleAddItem}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                    </Button>

                    <form action={formAction}>
                        <input type="hidden" name="restaurantId" value={details.id} />
                        <input type="hidden" name="menuData" value={JSON.stringify(menu)} />
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
                            ) : (
                                <><Save className="mr-2 h-4 w-4" />Save Menu</>
                            )}
                        </Button>
                    </form>
                </CardFooter>
            </Card>

            <MenuDataTable columns={columns} data={menu.items} />

            {state?.error && <p className="text-sm text-red-500 mt-2">{state.error}</p>}
            {state?.success && (
                <p className="text-sm text-green-500 mt-2">{state.success}</p>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {currentItem && menu.items.some((i) => i.id === currentItem.id)
                                ? 'Edit'
                                : 'Add'}{' '}
                            Menu Item
                        </DialogTitle>
                    </DialogHeader>
                    {currentItem && (
                        <MenuItemForm
                            key={currentItem.id}
                            item={currentItem}
                            categories={menu.categories}
                            onSave={handleSaveItem}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}