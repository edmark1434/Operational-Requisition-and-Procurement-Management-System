<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Make;
use Illuminate\Http\Request;
use Inertia\Inertia;
class MakesAndCategories extends Controller
{
    protected $base_path = "tabs/11-MakesAndCategories";
    public function index()
    {
        $success = session()->pull('success');
        $message = session()->pull('message');
        $make = Make::where('is_active',true)->get();
        $categories = Category::where('is_active',true)->get();
        $makeList = $make->map(function ($mk) {
            return [
                "ID" => $mk->id,
                "NAME" => $mk->name,
                "IS_ACTIVE" => $mk->is_active
            ];
        });
        $categoriesList = $categories->map(function ($categ) {
            return [
                "CAT_ID" => $categ->id,
                "NAME" => $categ->name,
                "DESCRIPTION" => $categ->description,
                "TYPE" => $categ->type,
                "IS_ACTIVE" => $categ->is_active, // 
            ];
        });
        return Inertia::render($this->base_path . '/Main',[
            'makeList' => $makeList,
            'categoriesList' => $categoriesList,
            'success' => $success,
            'message' => $message
        ]);
    }
    public function store_category(){
        return Inertia::render($this->base_path .'/components/CategoryAdd');
    }
    public function create_category(Request $request){
        Category::create([
            'name' => $request->input('NAME'),
            'description' => $request->input('DESCRIPTION'),
            'type' => $request->input('TYPE'),
        ]);
        return redirect()->route('makesandcategories')->with([
            'success' => true,
            'message' => 'Category added successfully'
        ]);
    }
    public function edit_category($id){
        $category = Category::findOrFail($id);
        return Inertia::render($this->base_path .'/components/CategoryEdit', [
            'categoryId' => (int)$id,
            'category' => [
                'NAME' => $category->name,
                'DESCRIPTION' => $category->description,
                'TYPE' => $category->type
            ]
        ]);
    }
    public function update_category(Request $request,$id){
        Category::findOrFail($id)->update([
            'name' => $request->input('NAME'),
            'description' => $request->input('DESCRIPTION'),
            'type' => $request->input('TYPE'),
        ]);
        return redirect()->route('makesandcategories')->with([
            'success' => true,
            'message' => 'Category updated successfully'
        ]);
    }
    public function store_make(){
        return Inertia::render($this->base_path .'/components/MakeAdd');
    }
    public function create_make(Request $request){
        Make::create([
            'name' => $request->input('NAME'),
            'is_active' => $request->input('IS_ACTIVE'),
        ]);
        return redirect()->route('makesandcategories')->with([
            'success' => true,
            'message' => 'Make added successfully'
        ]);
    }
    public function edit_make($id){
        $make = Make::where('id',$id)->first();
        return Inertia::render($this->base_path .'/components/MakeEdit', [
            'makeId' => (int)$id,
            'make' => [
                'NAME' => $make->name,
                'IS_ACTIVE' => $make->is_active
            ]
        ]);
    }
    public function update_make(Request $request,$id){
        Make::findOrFail($id)->update([
            'name' => $request->input('NAME'),
            'is_active' => $request->input('IS_ACTIVE'),
        ]);
        return redirect()->route('makesandcategories')->with([
            'success' => true,
            'message' => 'Make updated successfully'
        ]);
    }

    public function delete($id){
        Make::findOrFail($id)->update(['is_active' => false]);
        return redirect()->route('makesandcategories')->with([
            'success' => true,
            'message' => 'Make deleted successfully'
        ]);
    }
    public function categDelete($id){
        Category::findOrFail($id)->update(['is_active' => false]);
        return redirect()->route('makesandcategories')->with([
            'success' => true,
            'message' => 'Make deleted successfully'
        ]);
    }

    public function deleteModel($id){
        Make::findOrFail($id)->update(['is_active' => false]);
    }
    public function CategDeleteModel($id){
        Category::findOrFail($id)->update(['is_active' => false]);
    }
}

