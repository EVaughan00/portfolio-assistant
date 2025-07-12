import { auth } from '@/app/(auth)/auth';
import { getPortfolioImages, deletePortfolioImage, getPortfolioImageById } from '@/lib/db/queries';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolioId');

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 });
    }

    const images = await getPortfolioImages({ portfolioId });
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Failed to fetch portfolio images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio images' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    // Check if image exists and get portfolio info for authorization
    const imageData = await getPortfolioImageById({ id: imageId });
    if (!imageData) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // For regular users, verify they own the portfolio containing this image
    if (session.user.type === 'regular') {
      // We need to check if the portfolio belongs to the user
      // This will be handled by the deletePortfolioImage function with user validation
    }

    const deletedImage = await deletePortfolioImage({ id: imageId, userId: session.user.id });

    return NextResponse.json({
      success: true,
      deletedImage,
    });
  } catch (error) {
    console.error('Portfolio image deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete portfolio image' },
      { status: 500 }
    );
  }
} 