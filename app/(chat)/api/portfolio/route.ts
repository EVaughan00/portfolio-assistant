import { auth } from '@/app/(auth)/auth';
import { createPortfolio, addPortfolioImage, getPortfoliosByUserId, getPortfolioById, deletePortfolioById } from '@/lib/db/queries';
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { z } from 'zod';

const CreatePortfolioSchema = z.object({
  name: z.string().min(1, 'Portfolio name is required').max(100, 'Portfolio name must be less than 100 characters'),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    
    // Validate the form data
    const validatedData = CreatePortfolioSchema.parse({
      name,
      description: description || undefined,
    });

    // Create the portfolio
    const portfolio = await createPortfolio({
      name: validatedData.name,
      description: validatedData.description,
      userId: session.user.id,
    });

    // Handle image uploads
    const images = formData.getAll('images') as File[];
    const uploadedImages = [];

    for (const image of images) {
      if (image.size > 0) {
        // Validate image
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) {
          return NextResponse.json(
            { error: 'Invalid image type. Only JPEG, PNG, and WebP are allowed.' },
            { status: 400 }
          );
        }

        if (image.size > 5 * 1024 * 1024) { // 5MB limit
          return NextResponse.json(
            { error: 'Image size must be less than 5MB' },
            { status: 400 }
          );
        }

        // Upload to Vercel Blob
        const fileBuffer = await image.arrayBuffer();
        const filename = `portfolio-${portfolio.id}-${Date.now()}-${image.name}`;
        
        const blob = await put(filename, fileBuffer, {
          access: 'public',
          contentType: image.type,
        });

        // Save image reference to database
        const portfolioImage = await addPortfolioImage({
          portfolioId: portfolio.id,
          imageUrl: blob.url,
          imageName: image.name,
          contentType: image.type,
        });

        uploadedImages.push(portfolioImage);
      }
    }

    return NextResponse.json({
      success: true,
      portfolio: {
        ...portfolio,
        images: uploadedImages,
      },
    });
  } catch (error) {
    console.error('Portfolio creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create portfolio' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const portfolios = await getPortfoliosByUserId({ userId: session.user.id });
    return NextResponse.json({ portfolios });
  } catch (error) {
    console.error('Failed to fetch portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only allow regular users to delete portfolios
  if (session.user.type !== 'regular') {
    return NextResponse.json({ error: 'Guests cannot delete portfolios' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('id');

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 });
    }

    // Verify the portfolio belongs to the user before deleting
    const portfolio = await getPortfolioById({ id: portfolioId });
    
    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    if (portfolio.userId !== session.user.id) {
      return NextResponse.json({ error: 'You can only delete your own portfolios' }, { status: 403 });
    }

    await deletePortfolioById({ id: portfolioId });

    return NextResponse.json({ success: true, message: 'Portfolio deleted successfully' });
  } catch (error) {
    console.error('Failed to delete portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to delete portfolio' },
      { status: 500 }
    );
  }
} 