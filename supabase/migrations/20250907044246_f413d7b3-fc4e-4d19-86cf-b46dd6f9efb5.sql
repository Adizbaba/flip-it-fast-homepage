-- Create messages table for buyer-seller communication
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for messages table
CREATE POLICY "Users can view messages for their orders" 
ON public.messages 
FOR SELECT 
USING (
  auth.uid() = sender_id OR 
  auth.uid() = receiver_id OR
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = messages.order_id 
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages for their orders" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = messages.order_id 
    AND (orders.user_id = auth.uid() OR orders.user_id = receiver_id)
  )
);

-- Create trigger for updated_at on messages
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_messages_order_id ON public.messages(order_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Update order status enum if needed
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'shipped', 'delivered', 'completed'));