import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { LoadingSpinner } from './LoadingSpinner.jsx';
import { cn } from '../../lib/utils.js';

export function LoadingOverlay({ 
  isLoading, 
  message = 'Loading...',
  fullScreen = false,
  className
}) {
  if (!isLoading) return null;

  return (
    <Transition.Root show={isLoading} as={Fragment}>
      <Dialog 
        as="div" 
        className={cn(
          "relative z-50",
          fullScreen ? "fixed inset-0" : "absolute inset-0"
        )}
        onClose={() => {}}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500/75 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <LoadingSpinner size="lg" />
                  {message && (
                    <Dialog.Title
                      as="h3"
                      className="text-center text-lg font-medium text-gray-900"
                    >
                      {message}
                    </Dialog.Title>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
