import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CourseCardProps {
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    price?: number;
    category?: string;
}

export function CourseCard({ id, title, description, imageUrl, price, category }: CourseCardProps) {
    return (
        <Card className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-video w-full bg-zinc-100 overflow-hidden flex-shrink-0">
                {imageUrl ? (
                    <img src={imageUrl} alt={title} className="object-cover w-full h-full" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 bg-zinc-100">
                        No Image
                    </div>
                )}
            </div>
            <CardHeader className="flex-grow">
                <CardTitle className="line-clamp-2">{title}</CardTitle>
                <CardDescription className="line-clamp-2">{description}</CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-between items-center pr-4">
               {category && <Badge variant="secondary">{category}</Badge>}
               <Link href={`/courses/${id}`} className="text-sm font-medium hover:underline ml-auto">
                    View Course &rarr;
               </Link>
            </CardFooter>
        </Card>
    );
}
