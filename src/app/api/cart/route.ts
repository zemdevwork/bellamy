//app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Cart API called");
    
    // Get session from request
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      console.log("❌ No session in API route");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log("✅ Session found in API:", session.user.id);

    // Get user cart with items and products
    const cart = await prisma.cart.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
    });

    console.log("✅ Cart API result:", cart ? `${cart.items.length} items` : 'null');
    
    return NextResponse.json(cart);
  } catch (error) {
    console.error('❌ Cart API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}