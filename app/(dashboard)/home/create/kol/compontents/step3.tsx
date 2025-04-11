"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useStepperContext } from "@/app/context/stepper-context";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import QueryMask from "@/app/components/comm/QueryMask";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAppSelector, useAppDispatch } from "@/app/store/hooks";
import { updateFrom } from "@/app/store/reducers/userSlice";
import Image from "next/image";

const formSchema = z.object({
  interactive: z.string().min(1).max(200),
});

export default function StepThree() {
  const { handleNext, handleBack, currentStep } = useStepperContext();
  const [search, setSearch] = useState("");
  const kols = useAppSelector((state: any) => state.userReducer.config.kols);

  const step3Init = useAppSelector(
    (state: any) => state.userReducer.from.step3
  );
  const dispatch = useAppDispatch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interactive: step3Init?.interactive || "",
    },
  });

  const prevValuesRef = useRef(form.getValues());

  const initialRenderRef = useRef(true);

  useEffect(() => {
    const subscription = form.watch((values) => {
      const currentValues = form.getValues();

      if (
        JSON.stringify(currentValues) !== JSON.stringify(prevValuesRef.current)
      ) {
        dispatch(updateFrom({ key: "step3", value: currentValues }));
        prevValuesRef.current = { ...currentValues };
      }
    });

    return () => subscription.unsubscribe();
  }, [form, dispatch]);

  useEffect(() => {
    if (initialRenderRef.current && step3Init) {
      form.reset({
        interactive: step3Init.interactive || "",
      });
      initialRenderRef.current = false;
    }
  }, [step3Init, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    handleNext();
  }

  const [selectedKOL, setSelectedKOL] = useState<number[]>([]);

  const selectKOL = (id: number) => {
    if (selectedKOL.includes(id)) {
      return;
    }
    
    setSelectedKOL([...selectedKOL, id]);
    
    const kol = kols.find((k: any) => k.id === id);
    
    if (kol) {
      const currentValue = form.getValues("interactive") || "";
      
      let newValue;
      if (currentValue && currentValue.trim() !== "") {
        newValue = `${currentValue},${kol.name}`;
      } else {
        newValue = kol.name;
      }
      
      form.setValue("interactive", newValue);
    }
  };

  // 分页状态
  const [displayedKols, setDisplayedKols] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 24;
  
  // 搜索相关状态
  const [filteredKols, setFilteredKols] = useState<any[]>([]);
  
  // 实现模糊搜索的函数
  useEffect(() => {
    // 重置分页
    setPage(1);
    
    // 如果搜索框为空，使用完整的kols数据
    if (!search.trim()) {
      setFilteredKols(kols);
      
      // 加载第一页数据
      const initialItems = kols.slice(0, ITEMS_PER_PAGE);
      setDisplayedKols(initialItems);
      setHasMore(kols.length > ITEMS_PER_PAGE);
      return;
    }
    
    // 执行模糊搜索
    const searchLower = search.toLowerCase();
    const results = kols.filter((kol: any) => 
      kol.name.toLowerCase().includes(searchLower)
    );
    
    // 更新过滤后的KOLs
    setFilteredKols(results);
    
    // 设置第一页的显示数据
    const firstPageResults = results.slice(0, ITEMS_PER_PAGE);
    setDisplayedKols(firstPageResults);
    setHasMore(results.length > ITEMS_PER_PAGE);
  }, [search, kols]);
  
  // 加载更多KOLs的函数 - 现在基于filteredKols而不是kols
  const loadMoreKols = useCallback(() => {
    if (!hasMore) return;
    
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
    const endIndex = nextPage * ITEMS_PER_PAGE;
    
    // 检查是否还有更多数据可加载
    if (startIndex >= filteredKols.length) {
      setHasMore(false);
      return;
    }
    
    // 从过滤后的数据中获取下一页数据
    const nextItems = filteredKols.slice(startIndex, endIndex);
    
    // 更新展示数据和页码
    setDisplayedKols(prev => [...prev, ...nextItems]);
    setPage(nextPage);
    
    // 检查是否还有更多数据
    setHasMore(endIndex < filteredKols.length);
  }, [filteredKols, page, hasMore]);
  
  // 设置Intersection Observer来监测滚动到底部
  useEffect(() => {
    const currentLoaderRef = loaderRef.current;
    
    if (!currentLoaderRef) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreKols();
        }
      },
      { threshold: 0.5 }
    );
    
    observer.observe(currentLoaderRef);
    
    return () => {
      if (currentLoaderRef) {
        observer.unobserve(currentLoaderRef);
      }
    };
  }, [loadMoreKols, hasMore]);
  
  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6 px-2">
      <div className="flex-1 h-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="interactive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex flex-col gap-2">
                      <span className="text-lg font-bold capitalize">
                        interactive KOL
                      </span>
                      <span className="text-sm text-gray-500">
                        Select or enter keywords to find KOL that you would like
                        to Interactive to
                      </span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <div className="border rounded-md px-2 shadow-sm group transition-colors focus-within:border-primary">
                      <div className="w-full relative">
                        <Textarea
                          {...field}
                          placeholder="Enter your KOL"
                          maxLength={200}
                          minLength={1}
                          className="text-md border-none shadow-none pl-0 pr-10 "
                        />
                        <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                          {field.value?.length || 0}/200
                        </div>
                      </div>
                      <div className="w-full border-t my-2 px-4"></div>
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-slate-500">
                            Suggested KOL
                          </p>
                          <div className="flex items-center gap-1 relative">
                            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                              placeholder="Search"
                              className="w-24 bg-foreground text-xs py-1 px-2 pl-6 rounded-full"
                              value={search}
                              onChange={handleSearchChange}
                            />
                          </div>
                        </div>
                        <ScrollArea className="h-38 pb-2">
                          <div className="grid grid-cols-3 gap-1">
                            {displayedKols.map((kol: any, index: number) => (
                              <div
                                key={index}
                                className={cn(
                                  "flex items-center gap-1 p-1 rounded-sm bg-slate-100 hover:bg-slate-200 cursor-pointer",
                                  // selectedKOL.includes(kol.id)
                                  //   ? "bg-slate-50 text-primary/50 cursor-not-allowed pointer-events-none opacity-80"
                                  //   : ""
                                )}
                                onClick={() => selectKOL(kol.id)}
                              >
                                <div className="w-6 min-w-6 h-6 bg-gray-200 rounded-full overflow-hidden">
                                  <img
                                    src={kol.profile_image_url}
                                    alt={kol.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex flex-col w-full overflow-hidden">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <p className="text-sm font-bold w-full truncate">
                                          {kol.name}
                                        </p>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="flex flex-col gap-1">
                                          <p className="text-sm font-bold">
                                            {kol.name}
                                          </p>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          {/* 加载更多触发区域 */}
                          {hasMore && (
                            <div 
                              ref={loaderRef} 
                              className="h-4 w-full flex items-center justify-center my-2"
                            >
                              <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
                            </div>
                          )}
                          
                          {/* 没有结果时显示提示 */}
                          {displayedKols.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-20 text-gray-500">
                              <p>No KOLs found</p>
                              <p className="text-xs">Try a different search term</p>
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button
                onClick={handleBack}
                variant="ghost"
                type="button"
                className={`duration-350 h-10 rounded transition text-md ${
                  currentStep === 1
                    ? "pointer-events-none opacity-50 text-neutral-400"
                    : "text-neutral-400 hover:text-neutral-700"
                }`}
              >
                Previous
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="duration-350 h-10 flex items-center justify-center font-bold px-10"
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
