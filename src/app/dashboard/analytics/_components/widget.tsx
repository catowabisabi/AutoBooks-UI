// // _components/widget.tsx
// 'use client';
//
// import { useState } from 'react';
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { IconEdit, IconResize, IconTrash } from '@tabler/icons-react';
// import { ChartRenderer } from './chart-renderer';
//
// export type WidgetType = 'text' | 'bar' | 'area' | 'pie';
//
// export interface WidgetData {
//   id: string;
//   dashboardId: string;
//   type: WidgetType;
//   title: string;
//   description: string;
//   size: { width: number; height: number };
//   content?: string;
//   data?: any[];
//   xKey?: string;
//   yKey?: string;
//   labelKey?: string;
//   valueKey?: string;
// }
//
// interface WidgetProps {
//   widget: WidgetData;
//   isOverlay?: boolean;
//   onDelete?: (id: string) => void;
// }
//
// export default function Widget({
//   widget,
//   isOverlay = false,
//   onDelete
// }: WidgetProps) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [textContent, setTextContent] = useState(widget.content || '');
//
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({
//       id: widget.id,
//       data: { type: 'Widget', widget }
//     });
//
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     gridColumn: `span ${widget.size.width}`,
//     gridRow: `span ${widget.size.height}`
//   };
//
//   const handleSaveText = () => {
//     widget.content = textContent;
//     setIsEditing(false);
//   };
//
//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className={cn('relative', isOverlay && 'z-50 opacity-80')}
//       {...attributes}
//       {...listeners}
//     >
//       <Card className='h-full'>
//         <CardHeader className='cursor-move'>
//           <div className='flex items-center justify-between'>
//             <CardTitle className='text-lg'>{widget.title}</CardTitle>
//             <div className='flex gap-1'>
//               {widget.type === 'text' && (
//                 <Button
//                   variant='ghost'
//                   size='icon'
//                   className='h-8 w-8'
//                   onClick={() => setIsEditing(true)}
//                 >
//                   <IconEdit className='h-4 w-4' />
//                 </Button>
//               )}
//               <Button variant='ghost' size='icon' className='h-8 w-8'>
//                 <IconResize className='h-4 w-4' />
//               </Button>
//               <Button
//                 variant='ghost'
//                 size='icon'
//                 className='h-8 w-8'
//                 onClick={() => onDelete && onDelete(widget.id)}
//               >
//                 <IconTrash className='h-4 w-4' />
//               </Button>
//             </div>
//           </div>
//           <CardDescription>{widget.description}</CardDescription>
//         </CardHeader>
//         <CardContent
//           className={cn(
//             'p-6',
//             widget.type !== 'text' && 'flex items-center justify-center'
//           )}
//         >
//           {widget.type === 'text' && !isEditing && (
//             <div className='prose max-w-none'>
//               {widget.content || 'Click edit to add text content'}
//             </div>
//           )}
//           {widget.type === 'text' && isEditing && (
//             <div className='flex flex-col gap-4'>
//               <textarea
//                 className='min-h-[100px] w-full rounded-md border p-2'
//                 value={textContent}
//                 onChange={(e) => setTextContent(e.target.value)}
//                 placeholder='Enter text content here...'
//               />
//               <div className='flex justify-end gap-2'>
//                 <Button
//                   variant='outline'
//                   size='sm'
//                   onClick={() => setIsEditing(false)}
//                 >
//                   Cancel
//                 </Button>
//                 <Button size='sm' onClick={handleSaveText}>
//                   Save
//                 </Button>
//               </div>
//             </div>
//           )}
//
//           {widget.data && widget.data.length > 0 && widget.type !== 'text' ? (
//             <div className='h-40'>
//               <ChartRenderer
//                 type={widget.type}
//                 data={widget.data}
//                 title={widget.title}
//                 description={widget.description}
//                 xKey={widget.xKey}
//                 yKey={widget.yKey}
//                 labelKey={widget.labelKey}
//                 valueKey={widget.valueKey}
//               />
//             </div>
//           ) : (
//             <>
//               {widget.type === 'bar' && (
//                 <div className='bg-muted/30 flex h-40 w-full items-center justify-center rounded-md'>
//                   <div className='flex h-32 gap-2'>
//                     {[40, 65, 30, 70, 50, 90].map((height, i) => (
//                       <div
//                         key={i}
//                         className='bg-primary w-8 self-end rounded-t-sm'
//                         style={{ height: `${height}%` }}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               )}
//
//               {widget.type === 'area' && (
//                 <div className='bg-muted/30 flex h-40 w-full items-center justify-center rounded-md'>
//                   <svg viewBox='0 0 100 40' className='h-full w-full'>
//                     <path
//                       d='M0,40 L0,30 C10,25 20,35 30,20 C40,5 50,15 60,10 C70,5 80,15 90,20 L100,15 L100,40 Z'
//                       fill='rgba(var(--primary), 0.2)'
//                       stroke='hsl(var(--primary))'
//                       strokeWidth='1'
//                     />
//                   </svg>
//                 </div>
//               )}
//
//               {widget.type === 'pie' && (
//                 <div className='bg-muted/30 flex h-40 w-full items-center justify-center rounded-md'>
//                   <svg viewBox='0 0 100 100' className='h-32 w-32'>
//                     <circle
//                       cx='50'
//                       cy='50'
//                       r='40'
//                       fill='transparent'
//                       stroke='hsl(var(--primary))'
//                       strokeWidth='20'
//                       strokeDasharray='75 25'
//                     />
//                     <circle
//                       cx='50'
//                       cy='50'
//                       r='40'
//                       fill='transparent'
//                       stroke='hsl(var(--muted))'
//                       strokeWidth='20'
//                       strokeDasharray='25 75'
//                       strokeDashoffset='-75'
//                     />
//                   </svg>
//                 </div>
//               )}
//             </>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// _components/widget.tsx
// 'use client';
//
// import { useState } from 'react';
// import { useSortable } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle
// } from '@/components/ui/card';
// import { IconEdit, IconResize, IconTrash } from '@tabler/icons-react';
// import { ChartRenderer } from './chart-renderer';
//
// // Updated to include all chart types
// export type WidgetType =
//   | 'text'
//   | 'bar'
//   | 'area'
//   | 'pie'
//   | 'line'
//   | 'scatter'
//   | 'table';
//
// export interface WidgetData {
//   id: string;
//   dashboardId: string;
//   type: WidgetType;
//   title: string;
//   description: string;
//   size: { width: number; height: number };
//   content?: string;
//   data?: any[];
//   xKey?: string;
//   yKey?: string;
//   labelKey?: string;
//   valueKey?: string;
// }
//
// interface WidgetProps {
//   widget: WidgetData;
//   isOverlay?: boolean;
//   onDelete?: (id: string) => void;
// }
//
// export default function Widget({
//   widget,
//   isOverlay = false,
//   onDelete
// }: WidgetProps) {
//   const [isEditing, setIsEditing] = useState(false);
//   const [textContent, setTextContent] = useState(widget.content || '');
//
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({
//       id: widget.id,
//       data: { type: 'Widget', widget }
//     });
//
//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//     gridColumn: `span ${widget.size.width}`,
//     gridRow: `span ${widget.size.height}`
//   };
//
//   const handleSaveText = () => {
//     widget.content = textContent;
//     setIsEditing(false);
//   };
//
//   return (
//     <div
//       ref={setNodeRef}
//       style={style}
//       className={cn('relative', isOverlay && 'z-50 opacity-80')}
//       {...attributes}
//       {...listeners}
//     >
//       <Card className='flex h-full flex-col'>
//         <CardHeader className='flex-shrink-0 cursor-move pb-2'>
//           <div className='flex items-center justify-between'>
//             <CardTitle className='text-base font-semibold'>
//               {widget.title}
//             </CardTitle>
//             <div className='flex gap-1'>
//               {widget.type === 'text' && (
//                 <Button
//                   variant='ghost'
//                   size='icon'
//                   className='h-6 w-6'
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     setIsEditing(true);
//                   }}
//                 >
//                   <IconEdit className='h-3 w-3' />
//                 </Button>
//               )}
//               <Button
//                 variant='ghost'
//                 size='icon'
//                 className='h-6 w-6'
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <IconResize className='h-3 w-3' />
//               </Button>
//               <Button
//                 variant='ghost'
//                 size='icon'
//                 className='h-6 w-6'
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   onDelete && onDelete(widget.id);
//                 }}
//               >
//                 <IconTrash className='h-3 w-3' />
//               </Button>
//             </div>
//           </div>
//           <CardDescription className='text-xs'>
//             {widget.description}
//           </CardDescription>
//         </CardHeader>
//
//         <CardContent className='flex-1 overflow-hidden p-4 pt-2'>
//           {widget.type === 'text' && !isEditing && (
//             <div className='h-full overflow-auto'>
//               <div className='prose prose-sm max-w-none'>
//                 {widget.content || 'Click edit to add text content'}
//               </div>
//             </div>
//           )}
//
//           {widget.type === 'text' && isEditing && (
//             <div className='flex h-full flex-col gap-3'>
//               <textarea
//                 className='border-input bg-background ring-offset-background focus-visible:ring-ring w-full flex-1 resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
//                 value={textContent}
//                 onChange={(e) => setTextContent(e.target.value)}
//                 placeholder='Enter text content here...'
//               />
//               <div className='flex justify-end gap-2'>
//                 <Button
//                   variant='outline'
//                   size='sm'
//                   onClick={() => setIsEditing(false)}
//                 >
//                   Cancel
//                 </Button>
//                 <Button size='sm' onClick={handleSaveText}>
//                   Save
//                 </Button>
//               </div>
//             </div>
//           )}
//
//           {widget.data && widget.data.length > 0 && widget.type !== 'text' ? (
//             <div
//               className={cn(
//                 'w-full',
//                 widget.type === 'table' ? 'h-full' : 'h-full'
//               )}
//             >
//               <ChartRenderer
//                 type={widget.type}
//                 data={widget.data}
//                 title={widget.title}
//                 description={widget.description}
//                 xKey={widget.xKey}
//                 yKey={widget.yKey}
//                 labelKey={widget.labelKey}
//                 valueKey={widget.valueKey}
//               />
//             </div>
//           ) : widget.type !== 'text' ? (
//             <div className='flex h-full items-center justify-center'>
//               {/* Placeholder visualizations for empty widgets */}
//               {widget.type === 'bar' && (
//                 <div className='bg-muted/30 flex h-32 w-full items-center justify-center rounded-md'>
//                   <div className='flex h-24 gap-2'>
//                     {[40, 65, 30, 70, 50, 90].map((height, i) => (
//                       <div
//                         key={i}
//                         className='bg-primary w-6 self-end rounded-t-sm'
//                         style={{ height: `${height}%` }}
//                       />
//                     ))}
//                   </div>
//                 </div>
//               )}
//
//               {widget.type === 'area' && (
//                 <div className='bg-muted/30 flex h-32 w-full items-center justify-center rounded-md'>
//                   <svg viewBox='0 0 100 40' className='h-full w-full'>
//                     <path
//                       d='M0,40 L0,30 C10,25 20,35 30,20 C40,5 50,15 60,10 C70,5 80,15 90,20 L100,15 L100,40 Z'
//                       fill='rgba(var(--primary), 0.2)'
//                       stroke='hsl(var(--primary))'
//                       strokeWidth='1'
//                     />
//                   </svg>
//                 </div>
//               )}
//
//               {widget.type === 'pie' && (
//                 <div className='bg-muted/30 flex h-32 w-full items-center justify-center rounded-md'>
//                   <svg viewBox='0 0 100 100' className='h-24 w-24'>
//                     <circle
//                       cx='50'
//                       cy='50'
//                       r='40'
//                       fill='transparent'
//                       stroke='hsl(var(--primary))'
//                       strokeWidth='20'
//                       strokeDasharray='75 25'
//                     />
//                     <circle
//                       cx='50'
//                       cy='50'
//                       r='40'
//                       fill='transparent'
//                       stroke='hsl(var(--muted))'
//                       strokeWidth='20'
//                       strokeDasharray='25 75'
//                       strokeDashoffset='-75'
//                     />
//                   </svg>
//                 </div>
//               )}
//
//               {(widget.type === 'line' || widget.type === 'scatter') && (
//                 <div className='bg-muted/30 flex h-32 w-full items-center justify-center rounded-md'>
//                   <svg viewBox='0 0 100 40' className='h-full w-full'>
//                     <path
//                       d='M5,35 L20,25 L35,30 L50,15 L65,20 L80,10 L95,25'
//                       fill='none'
//                       stroke='hsl(var(--primary))'
//                       strokeWidth='2'
//                     />
//                     {widget.type === 'scatter' && (
//                       <>
//                         <circle
//                           cx='5'
//                           cy='35'
//                           r='2'
//                           fill='hsl(var(--primary))'
//                         />
//                         <circle
//                           cx='20'
//                           cy='25'
//                           r='2'
//                           fill='hsl(var(--primary))'
//                         />
//                         <circle
//                           cx='35'
//                           cy='30'
//                           r='2'
//                           fill='hsl(var(--primary))'
//                         />
//                         <circle
//                           cx='50'
//                           cy='15'
//                           r='2'
//                           fill='hsl(var(--primary))'
//                         />
//                         <circle
//                           cx='65'
//                           cy='20'
//                           r='2'
//                           fill='hsl(var(--primary))'
//                         />
//                         <circle
//                           cx='80'
//                           cy='10'
//                           r='2'
//                           fill='hsl(var(--primary))'
//                         />
//                         <circle
//                           cx='95'
//                           cy='25'
//                           r='2'
//                           fill='hsl(var(--primary))'
//                         />
//                       </>
//                     )}
//                   </svg>
//                 </div>
//               )}
//
//               {widget.type === 'table' && (
//                 <div className='bg-muted/30 flex h-32 w-full items-center justify-center rounded-md'>
//                   <div className='text-center'>
//                     <div className='mb-2 grid grid-cols-3 gap-1'>
//                       {Array.from({ length: 9 }, (_, i) => (
//                         <div
//                           key={i}
//                           className='bg-primary/20 h-3 w-8 rounded-sm'
//                         />
//                       ))}
//                     </div>
//                     <span className='text-muted-foreground text-xs'>
//                       Table Preview
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           ) : null}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// _components/widget.tsx
'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { IconEdit, IconResize, IconTrash } from '@tabler/icons-react';
import { ChartRenderer } from './chart-renderer';
import { MarkdownDisplay } from '@/components/ui/markdown-display';

// Import shared types
import type { WidgetData } from '@/types/dashboard';

interface WidgetProps {
  widget: WidgetData;
  isOverlay?: boolean;
  onDelete?: (id: string) => void;
}

export default function Widget({
  widget,
  isOverlay = false,
  onDelete
}: WidgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [textContent, setTextContent] = useState(widget.content || '');

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: widget.id,
      data: { type: 'Widget', widget }
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${widget.size.width}`,
    gridRow: `span ${widget.size.height}`
  };

  const handleSaveText = () => {
    widget.content = textContent;
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('relative', isOverlay && 'z-50 opacity-80')}
      {...attributes}
      {...listeners}
    >
      <Card className='flex h-full flex-col'>
        <CardHeader className='flex-shrink-0 cursor-move pb-2'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base font-semibold'>
              {widget.title}
            </CardTitle>
            <div className='flex gap-1'>
              {widget.type === 'text' && (
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-6 w-6'
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <IconEdit className='h-3 w-3' />
                </Button>
              )}
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6'
                onClick={(e) => e.stopPropagation()}
              >
                <IconResize className='h-3 w-3' />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                className='h-6 w-6'
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(widget.id);
                }}
              >
                <IconTrash className='h-3 w-3' />
              </Button>
            </div>
          </div>
          <CardDescription className='text-xs'>
            {widget.description}
          </CardDescription>
        </CardHeader>

        <CardContent className='flex-1 overflow-hidden p-4 pt-2'>
          {widget.type === 'text' && !isEditing && (
            <div className='h-full overflow-auto'>
              <MarkdownDisplay
                content={widget.content || 'Click edit to add text content'}
                className='prose prose-sm max-w-none'
              />
            </div>
          )}

          {widget.type === 'text' && isEditing && (
            <div className='flex h-full flex-col gap-3'>
              <textarea
                className='border-input bg-background ring-offset-background focus-visible:ring-ring w-full flex-1 resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none'
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder='Enter text content here...'
              />
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button size='sm' onClick={handleSaveText}>
                  Save
                </Button>
              </div>
            </div>
          )}

          {widget.data && widget.data.length > 0 && widget.type !== 'text' ? (
            <div
              className={cn(
                'w-full',
                widget.type === 'table' ? 'h-full' : 'h-full'
              )}
            >
              <ChartRenderer
                type={widget.type}
                data={widget.data}
                title={widget.title}
                description={widget.description}
                xKey={widget.xKey}
                yKey={widget.yKey}
                labelKey={widget.labelKey}
                valueKey={widget.valueKey}
              />
            </div>
          ) : widget.type !== 'text' ? (
            <div className='flex h-full items-center justify-center'>
              {/* Placeholder visualizations for empty widgets */}
              {widget.type === 'bar' && (
                <div className='bg-muted/30 flex h-32 w-full items-center justify-center rounded-md'>
                  <div className='flex h-24 gap-2'>
                    {[40, 65, 30, 70, 50, 90].map((height, i) => (
                      <div
                        key={i}
                        className='bg-primary w-6 self-end rounded-t-sm'
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {widget.type === 'area' && (
                <div className='bg-muted/30 flex h-32 w-full items-center justify-center rounded-md'>
                  <svg viewBox='0 0 100 40' className='h-full w-full'>
                    <path
                      d='M0,40 L0,30 C10,25 20,35 30,20 C40,5 50,15 60,10 C70,5 80,15 90,20 L100,15 L100,40 Z'
                      fill='rgba(var(--primary), 0.2)'
                      stroke='hsl(var(--primary))'
                      strokeWidth='1'
                    />
                  </svg>
                </div>
              )}

              {widget.type === 'pie' && (
                <div className='bg-muted/30 flex h-32 w-full items-center justify-center rounded-md'>
                  <svg viewBox='0 0 100 100' className='h-24 w-24'>
                    <circle
                      cx='50'
                      cy='50'
                      r='40'
                      fill='transparent'
                      stroke='hsl(var(--primary))'
                      strokeWidth='20'
                      strokeDasharray='75 25'
                    />
                    <circle
                      cx='50'
                      cy='50'
                      r='40'
                      fill='transparent'
                      stroke='hsl(var(--muted))'
                      strokeWidth='20'
                      strokeDasharray='25 75'
                      strokeDashoffset='-75'
                    />
                  </svg>
                </div>
              )}

              {(widget.type === 'line' || widget.type === 'scatter') && (
                <div className='bg-muted/30 flex h-32 w-full items-center justify-center rounded-md'>
                  <svg viewBox='0 0 100 40' className='h-full w-full'>
                    <path
                      d='M5,35 L20,25 L35,30 L50,15 L65,20 L80,10 L95,25'
                      fill='none'
                      stroke='hsl(var(--primary))'
                      strokeWidth='2'
                    />
                    {widget.type === 'scatter' && (
                      <>
                        <circle
                          cx='5'
                          cy='35'
                          r='2'
                          fill='hsl(var(--primary))'
                        />
                        <circle
                          cx='20'
                          cy='25'
                          r='2'
                          fill='hsl(var(--primary))'
                        />
                        <circle
                          cx='35'
                          cy='30'
                          r='2'
                          fill='hsl(var(--primary))'
                        />
                        <circle
                          cx='50'
                          cy='15'
                          r='2'
                          fill='hsl(var(--primary))'
                        />
                        <circle
                          cx='65'
                          cy='20'
                          r='2'
                          fill='hsl(var(--primary))'
                        />
                        <circle
                          cx='80'
                          cy='10'
                          r='2'
                          fill='hsl(var(--primary))'
                        />
                        <circle
                          cx='95'
                          cy='25'
                          r='2'
                          fill='hsl(var(--primary))'
                        />
                      </>
                    )}
                  </svg>
                </div>
              )}

              {widget.type === 'table' && (
                <div className='bg-muted/30 flex h-32 w-full items-center justify-center rounded-md'>
                  <div className='text-center'>
                    <div className='mb-2 grid grid-cols-3 gap-1'>
                      {Array.from({ length: 9 }, (_, i) => (
                        <div
                          key={i}
                          className='bg-primary/20 h-3 w-8 rounded-sm'
                        />
                      ))}
                    </div>
                    <span className='text-muted-foreground text-xs'>
                      Table Preview
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
